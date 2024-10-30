import { Artist } from "src/artist/entities/artist.entity";
import { Song } from "src/song/entities/song.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'album' })
export class Album {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    title: string

    @Column({ nullable: true})
    coverImgUrl: string

    @Column({ type: 'date' })
    releaseDate: Date

    @ManyToOne(() => Artist, artist => artist.albums, { onDelete: 'CASCADE' })
    artist: Artist

    @OneToMany(() => Song, song => song.album, { cascade: true })
    songs: Song[]

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
