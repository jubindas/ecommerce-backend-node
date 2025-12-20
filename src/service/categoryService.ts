import { prisma } from "../db/prisma";

import { CustomError } from "../middleware/errorHandler";

export interface CreateCategoryData {
  name: string;
  isActive?: boolean;
  description?: string;
  slug?: string;
  parentId?: string;
}

export interface UpdateCategoryData {
  name?: string;
  isActive?: boolean;
  description?: string;
  slug?: string;
  parentId?: string;
}

export const createCategory = async (data: CreateCategoryData) => {
  if (data.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: data.parentId },
    });

    if (!parent) {
      throw new CustomError("Parent category not found", 404);
    }
  }

  if (data.slug) {
    const existingSlug = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      throw new CustomError("Slug already exists", 400);
    }
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      isActive: data.isActive ?? true,
      description: data.description,
      slug: data.slug,
      parentId: data.parentId,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return category;
};

export const getAllCategories = async (
  page = 1,
  limit = 10,
  includeInactive = false
) => {
  const skip = (page - 1) * limit;

  const where = includeInactive ? {} : { isActive: true };

  const categories = await prisma.category.findMany({
    where,
    skip,
    take: limit,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          children: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.category.count({ where });

  return {
    categories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCategoryById = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      },
    },
  });

  if (!category) {
    throw new CustomError("Category not found", 404);
  }

  return category;
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      },
    },
  });

  if (!category) {
    throw new CustomError("Category not found", 404);
  }

  return category;
};

export const getRootCategories = async () => {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      isActive: true,
    },
    include: {
      _count: {
        select: {
          children: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

export const getCategoryChildren = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new CustomError("Category not found", 404);
  }

  const children = await prisma.category.findMany({
    where: {
      parentId: categoryId,
      isActive: true,
    },
    include: {
      _count: {
        select: {
          children: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return children;
};

export const updateCategory = async (
  categoryId: string,
  data: UpdateCategoryData
) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new CustomError("Category not found", 404);
  }

  if (data.parentId) {
    if (data.parentId === categoryId) {
      throw new CustomError("Category cannot be its own parent", 400);
    }

    const parent = await prisma.category.findUnique({
      where: { id: data.parentId },
    });

    if (!parent) {
      throw new CustomError("Parent category not found", 404);
    }

    const isDescendant = await checkIfDescendant(data.parentId, categoryId);
    if (isDescendant) {
      throw new CustomError(
        "Cannot set parent: would create circular reference",
        400
      );
    }
  }

  if (data.slug && data.slug !== category.slug) {
    const existingSlug = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      throw new CustomError("Slug already exists", 400);
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: data.name,
      isActive: data.isActive,
      description: data.description,
      slug: data.slug,
      parentId: data.parentId,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return updatedCategory;
};

export const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new CustomError("Category not found", 404);
  }

  const childrenCount = await prisma.category.count({
    where: { parentId: categoryId },
  });

  if (childrenCount > 0) {
    throw new CustomError(
      "Cannot delete category with children. Please delete or move children first.",
      400
    );
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: "Category deleted successfully" };
};

const checkIfDescendant = async (
  ancestorId: string,
  descendantId: string
): Promise<boolean> => {
  let currentId: string | null = descendantId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) {
      break;
    }
    visited.add(currentId);

    if (currentId === ancestorId) {
      return true;
    }

    const category: { parentId: string | null } | null =
      await prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

    if (!category) {
      break;
    }

    currentId = category.parentId;
  }

  return false;
};
