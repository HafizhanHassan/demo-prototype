import { 
    Entity, 
    BaseEntity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn } from "typeorm";
import { ObjectType, Field } from "type-graphql"

@ObjectType()
@Entity()
export class User extends BaseEntity{
    @Field()
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({unique: true })
    email!: string

    @Field()
    @Column({unique: true })
    username!: string
    
    @Column()
    password!: string

    @Field(() => String)
    @CreateDateColumn()
    createdAt : Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = Date()

   
}