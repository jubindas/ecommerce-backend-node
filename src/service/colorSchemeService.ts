import { prisma } from "../db/prisma";

import { ColorScheme } from "../generated/prisma/client";

interface CreateColorSchemeInput {
  name: string;
  description?: string;
}

interface UpdateColorSchemeInput extends Partial<CreateColorSchemeInput> {}

export const colorSchemeService = {
  async createColorScheme(input: CreateColorSchemeInput): Promise<ColorScheme> {
    return prisma.colorScheme.create({
      data: {
        ...input,
      },
    });
  },

  async getAllColorSchemes(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    return prisma.colorScheme.findMany({
      skip,
      take: limit,
    });
  },

  async updateColorScheme(
    colorSchemeId: string,
    input: UpdateColorSchemeInput
  ): Promise<ColorScheme> {
    return prisma.colorScheme.update({
      where: {
        id: colorSchemeId,
      },
      data: {
        ...input,
      },
    });
  },

  async deleteColorScheme(colorSchemeId: string): Promise<ColorScheme> {
    return prisma.colorScheme.delete({
      where: {
        id: colorSchemeId,
      },
    });
  },
};
