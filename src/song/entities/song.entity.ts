import { Album} from "src/album/entities/album.entity";
import { Artist } from "src/artist/entities/artist.entity";
import { Genre } from "src/genre/entities/genre.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'song'})
export class Song {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: true })
    title: string

    @Column({ nullable: true })
    coverImgUrl: string

    @Column({ nullable: true })
    fileUrl: string

    @ManyToMany(() => Genre, genre => genre.songs)
    @JoinTable({
        name: 'songs_genres',
        joinColumn: {
            name: 'song_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'genre_id',
            referencedColumnName: 'id'
        },
    })
    genres: Genre[]

    @ManyToMany(() => Artist, artist => artist.songs)
    @JoinTable({
        name: 'songs_artists',
        joinColumn: {
            name: 'song_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'artist_id',
            referencedColumnName: 'id'
        }
    })
    artists: Artist[]

    @ManyToOne(() => Album, album => album.songs, { nullable: true, onDelete: 'SET NULL' })
    album: Album

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
