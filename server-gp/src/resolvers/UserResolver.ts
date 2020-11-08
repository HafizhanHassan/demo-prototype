import { CreateUser } from "../input/CreateUser";
import { MyContext } from "../types";
import { Resolver, Mutation, Arg, Field, Query, Ctx, ObjectType } from "type-graphql";
import { User } from "../entities/User";
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmails";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError{
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;


}


@Resolver()
export class UserResolver {

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, req}: MyContext

    ): Promise<UserResponse> {

        if( newPassword.length <= 6){
            
            return  {
                errors: [{
                    field: 'newPassword',
                    message: 'Password must be greater than 6',
                },
            ],
        };
    }

    const key = FORGET_PASSWORD_PREFIX + token;

    const userId = await redis.get(key);

    if(!userId){
        return  {
            errors: [{
                field: 'token',
                message: 'token expired',
            },
            ],
        };

    }
  
      const userIdNum = parseInt(userId);
  
      const user = await User.findOne(userIdNum);

    if(!user){
    
        return  {
        
            errors: [{
            
                field: 'token',
                message: 'user no longer exist',
            },
        ],
    };
    
    }

   
    await User.update(
    
        { id: userIdNum },
    
        {
      
            password: await argon2.hash(newPassword),
    
        }
  
        );

        await redis.del(key);

        req.session.userId = user.id;

  
        return {user};
    }

  
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {redis} : MyContext
    ){
        const user = await User.findOne({where: {email}});
        if(!user){
            return true;
        }
        const token = v4();

        await redis.set(
            FORGET_PASSWORD_PREFIX + token, 
            user.id, 
            'ex',
            1000*60*60*24*3 
            );

        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
                    );

        return true;
        
    }

  
    @Query(() => User, { nullable: true}) 
    me(
      @Ctx() {req}: MyContext) {
      
        if( !req.session.userId){
          return null
      }

      return User.findOne(req.session.userId);

      
    }


  
    @Mutation(() => UserResponse)
  
    async register(
      @Arg('options') options: CreateUser,
      @Ctx() {req}: MyContext): Promise<UserResponse> {
      const errors  = validateRegister(options);
      if ( errors){
          return {errors};
      }
    
      
        const hashedPassword = await argon2.hash(options.password);
        let user;
    
        try{
        
            const result = await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values(
            {
                username: options.username,
                email: options.email,
                password: hashedPassword,
            })
            .returning("*")
            .execute();

            console.log("result: ", result);
            user = result.raw[0];
    
        }catch(err){
        console.log("Error: ", err);

        if(err.code === "23505"){
            return{
                errors: [
                    {
                        field: "username",
                        message: "username already taken"
                    },
                ],
            };
        }
        

        }

        req.session.userId = user.id;
        return {user};
    }

  
    @Mutation(() => UserResponse)
        async login(
            @Arg("usernameOrEmail") usernameOrEmail: string,
            @Arg("password") password: string,
            @Ctx() {req}: MyContext): Promise<UserResponse> {
      
                const user = await User.findOne(
          
                    usernameOrEmail.includes('@') 
                    ? {where: {email: usernameOrEmail}}
                    : {where: { username: usernameOrEmail}}
                );

            if(!user){
                return {
                    errors: [{
                        field: 'usernameOrEmail',
                        message: 'Username doesnt exist',
                    },
                ],
            };
        }
    
        const valid = await argon2.verify(user.password, password);

    
        if(!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: 'Incorrect password',
                },]
            }
        }

        req.session.userId = user.id;

    
        return {
            user,
        };
   }

  @Mutation(() => Boolean)
  logout(@Ctx() {req, res}: MyContext){
      return new Promise((resolve) =>  
        req.session.destroy(err => {
          res.clearCookie(COOKIE_NAME);
          if(err){
              resolve(false);
              return;
          }

          resolve(true);
        }))

  }
}