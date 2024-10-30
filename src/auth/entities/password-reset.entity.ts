import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'resetPassword'})
export class ResetPassword {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    resetToken: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', nullable: true })
    expriredAt: Date

    @ManyToOne(() => User, user => user.resetPassword, { onDelete: 'CASCADE'})
    user: User
}