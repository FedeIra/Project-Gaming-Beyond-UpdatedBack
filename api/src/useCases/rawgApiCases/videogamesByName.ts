import { VideogameByName } from '../../models/rawgApi/videogame.js';
import { VideogamesService } from '../../services/rawgVideogames/videogamesService.js';

export type GetVideogamesByNameInput = {
  name: string;
};

export type GetVideogamesByNameOutput = VideogameByName[];

export class GetVideogamesByNameUseCase {
  constructor(private videogamesService: VideogamesService) {}

  async getVideogamesByName(
    input: GetVideogamesByNameInput
  ): Promise<GetVideogamesByNameOutput> {
    return this.videogamesService.getVideogamesByName(input);
  }
}
