import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'token' })
export class Token {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    token: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date

    @Column({ type: 'timestamp', nullable: true })
    expriredAt: Date

    @Column({ type: 'boolean' , default: false})
    isRevoked: boolean

    @ManyToOne(() => User, user => user.tokens, { onDelete: 'CASCADE' })
    user: User
}