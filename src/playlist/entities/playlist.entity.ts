import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Song } from '../../song/entities/song.entity';
import { Transform } from 'class-transformer';

@Entity({ name: 'playlist' })
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  coverImgUrl: string;

  @Transform(({ value }) => {
    if (value) {
      return {
        id: value.id,
        username: value.username,
        email: value.email,
        avatarUrl: value.avatarUrl
      };
    }
    return value;
  })
  @ManyToOne(() => User, user => user.playlists)
  user: User;

  @ManyToMany(() => Song)
  @JoinTable({
    name: 'playlists_songs',
    joinColumn: {
      name: 'playlist_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'song_id',
      referencedColumnName: 'id'
    }
  })
  songs: Song[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}