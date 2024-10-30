import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.enum";
import { Token } from "./token.entity";
import { EmailVerification } from "./email-verification.entity";
import { ResetPassword } from "./password-reset.entity";
import { Artist } from "src/artist/entities/artist.entity";
import { Playlist } from "src/playlist/entities/playlist.entity";
import { Exclude } from "class-transformer";

@Entity({ name: 'user' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    username: string

    @Column({ unique: true })
    email: string

    @Exclude()
    @Column({ unique: true })
    password: string

    @Column({ nullable: true })
    avatarUrl?: string

    @OneToMany(() => Playlist, playlist => playlist.user, { cascade: true })
    playlists: Playlist[];

    @Column({ default: false })
    isActive: boolean

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.LISTENER
    })
    role: Role

    @OneToMany(() => Token, token => token.user, { cascade: true })
    tokens: Token[]

    @OneToMany(() => EmailVerification, emailToken => emailToken.user, { cascade: true })
    emailVerification: EmailVerification[]

    @OneToMany(() => ResetPassword, resetToken => resetToken.user, { cascade: true })
    resetPassword: ResetPassword[]
}
