import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({name: 'emailVerification'})
export class EmailVerification {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    token: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date
    
    @Column({ type: 'timestamp', nullable: true })
    expriredAt: Date

    @ManyToOne(() => User, user => user.emailVerification, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User
}