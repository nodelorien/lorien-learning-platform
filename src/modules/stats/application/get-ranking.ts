import { StatsRepository } from '../domain/stats-repository';
import { RankingEntry } from '../domain/user-exercise-stats';

export class GetRanking {
  constructor(private readonly statsRepository: StatsRepository) {}

  async execute(): Promise<RankingEntry[]> {
    return this.statsRepository.getRanking();
  }
}
