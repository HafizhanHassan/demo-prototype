import { Field, InputType } from "type-graphql";

@InputType()

export class CreateUser{
     
    @Field()
    username: string
    
    @Field()
    email: string 
    

    @Field()
    password: string
}