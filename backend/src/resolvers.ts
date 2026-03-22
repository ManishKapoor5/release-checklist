import { PrismaClient } from '@prisma/client';
import { JSONResolver, DateTimeResolver } from 'graphql-scalars';
import { RELEASE_STEPS, computeStatus } from './utils/computeStatus';

const prisma = new PrismaClient();

export const resolvers = {
  JSON: JSONResolver,
  DateTime: DateTimeResolver,
  Release: {
    status: (parent: any) => {
      let stepsObj = {};
      try {
        stepsObj = JSON.parse(parent.steps);
      } catch (e) {}
      return computeStatus(stepsObj);
    },
    steps: (parent: any) => {
      try {
         return JSON.parse(parent.steps);
      } catch(e) {
         return {};
      }
    }
  },
  Query: {
    releases: async () => {
      return prisma.release.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    release: async (_: any, { id }: { id: string }) => {
      return prisma.release.findUnique({ where: { id } });
    }
  },
  Mutation: {
    createRelease: async (_: any, args: any) => {
      const initialSteps = Object.fromEntries(RELEASE_STEPS.map((s) => [s, false]));

      return prisma.release.create({
        data: {
          name: args.name,
          targetDate: new Date(args.targetDate),
          additionalInfo: args.additionalInfo,
          steps: JSON.stringify(initialSteps)
        }
      });
    },
    updateRelease: async (_: any, args: any) => {
      const { id, name, targetDate, steps, additionalInfo } = args;
      const data: any = {};
      if (name !== undefined) data.name = name;
      if (targetDate !== undefined) data.targetDate = new Date(targetDate);
      if (steps !== undefined) data.steps = JSON.stringify(steps);
      if (additionalInfo !== undefined) data.additionalInfo = additionalInfo;

      return prisma.release.update({
        where: { id },
        data
      });
    },
    deleteRelease: async (_: any, { id }: { id: string }) => {
      await prisma.release.delete({ where: { id } });
      return id;
    }
  }
};
