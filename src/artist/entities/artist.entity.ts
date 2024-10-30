import { Album } from "src/album/entities/album.entity";
import { User } from "src/auth/entities/user.entity";
import { Song } from "src/song/entities/song.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'artist' })
export class Artist {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false, unique: true })
    name: string

    @Column({ nullable: true })
    avatarUrl: string

    @ManyToMany(() => Song, song => song.artists)
    songs: Song[]

    @OneToMany(() => Album, album => album.artist, { cascade: true })
    albums: Album[]

    // @ManyToMany(() => User, user => user.artists)
    // users: User[]

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
