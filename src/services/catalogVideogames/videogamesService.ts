import { RawgApiClient } from "../../../pkg/rawgApiClient/rawgApiClient.js";
import config from "../../../pkg/env/config.js";

import { Videogame } from "../../models/videogame.js";
import { Result, GenreData, PlatformElement } from "../../models/videogames.js";
import { getVideogamesResponseSchema } from "./endpoints/getVideogames.js";
import { toModelVideogames } from "./entities/videogames.js";

import { GetVideogamesByNameInput } from "../../useCases/videogamesByName.js";
import { GetVideogamesByNamePayload } from "./endpoints/getVideogamesByName.js";

import { VideogameDetail, Store } from "../../models/videogameDetail.js";
import { GetVideogameDetailPayload, getVideogameDetailResponseSchema } from "./endpoints/getVideogameDetail.js";
import { toModelVideogameDetail } from "./entities/videogameDetail.js";
import { GetVideogameDetailInput } from "../../useCases/videogameDetails.js";

import { GenreName, ResultGenresApi } from "../../models/genres.js";
import { getGenresResponseSchema } from "./endpoints/getGenres.js";
import { toModelGenres } from "./entities/genres.js";


export interface VideogamesService {
    getVideogames(): Promise<Videogame[]>;
    getVideogamesByName(payload: GetVideogamesByNameInput): Promise<Videogame[]>;
    getVideogameDetail(input: GetVideogameDetailInput): Promise<VideogameDetail>;
    getGenres(): Promise<GenreName[]>;
}

export class RawgVideogamesService implements VideogamesService {
  constructor(private client: RawgApiClient) {}

  async filterAndValidateVideogamesOutput (payload: Result[]): Promise<Videogame[]> {

    const apiResponseResults = payload.map((game: Result) => {

      return {
        id: game.id,
        name: game.name,
        image: game.background_image,
        genres: game.genres.map((genre: GenreData) => genre.name),
        rating: game.rating,
        platforms: game.platforms.map((platform: PlatformElement) => platform.platform.name),
        releaseDate: game.released,
      };
    }
    );

    const apiResponseValidation = getVideogamesResponseSchema.parse(apiResponseResults);
    const videogames = toModelVideogames(apiResponseValidation);
    return videogames;
  }

  async getVideogames(): Promise<Videogame[]> {

    const totalPages = 10;
    const apiResponse = [];

    for (let page = 1; page < totalPages; page++) {
      const apiResponsePage: any = await this.client.send({
        method: "get",
        path: `/games?key=${config.api_key}&page=${page}`,
        payload: {},
    });
    apiResponse.push(...apiResponsePage.results);
    }

    const videogames = await this.filterAndValidateVideogamesOutput(apiResponse);
    return videogames;
  }

  async getVideogamesByName(payload: GetVideogamesByNamePayload): Promise<Videogame[]>{
    const name = payload.name;

    const apiResponse: any = await this.client.send({
      method: "get",
      path: `/games?key=${config.api_key}&search=${name}`,
      payload,
  });

  const videogames = await this.filterAndValidateVideogamesOutput(apiResponse.results);
  return videogames;
};

  async getVideogameDetail(payload: GetVideogameDetailPayload): Promise<VideogameDetail> {

    const videogameId = payload.videogameId;

    const apiResponse: any = await this.client.send({
      method: "get",
      path: `/games/${videogameId}?key=${config.api_key}`,
      payload,
  });

  const apiResponseFilter =  {
    name: apiResponse.name,
    image: apiResponse.background_image,
    description: apiResponse.description.replace(/(<([^>]+)>)/gi, '')
    .replace(/&#39;/g, ''),
    genres: apiResponse.genres.map((genre: GenreData) => genre.name),
    rating: apiResponse.rating,
    totalReviews: apiResponse.ratings_count,
    platforms: apiResponse.platforms.map((platform: PlatformElement) => platform.platform.name),
    releaseDate: apiResponse.released,
    stores: apiResponse.stores.map((store: Store) => store.store.domain),
  };

  const apiResponseValidation = getVideogameDetailResponseSchema.parse(apiResponseFilter);
  const videogameDetail = toModelVideogameDetail(apiResponseValidation);

  return videogameDetail;
  }

  async getGenres(): Promise<GenreName[]>{

    const apiResponse: any = await this.client.send({
      method: "get",
      path: `/genres?key=${config.api_key}`,
      payload: {},
  });

  const apiResponseFilter = apiResponse.results.map((genre: ResultGenresApi) => genre.name);
  // console.log("🚀 ~ file: videogamesService.ts:122 ~ RawgVideogamesService ~ getGenres ~ apiResponseFilter:", apiResponseFilter)

  const apiResponseValidation = getGenresResponseSchema.parse(apiResponseFilter);
  console.log("🚀 ~ file: videogamesService.ts:125 ~ RawgVideogamesService ~ getGenres ~ apiResponseValidation:", apiResponseValidation)

  const genres = toModelGenres(apiResponseValidation);

  return genres;
  }
}
