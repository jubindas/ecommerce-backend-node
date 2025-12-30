import { Request, Response } from "express";

import { validationResult } from "express-validator";

import { colorSchemeService } from "../service/colorSchemeService";

import { asyncHandler } from "../lib/asyncHandler";

export const createColorScheme = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { name, description } = req.body;

    const colorScheme = await colorSchemeService.createColorScheme({
      name,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Color scheme created successfully",
      data: colorScheme,
    });
  }
);

export const getAllColorSchemes = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const colorSchemes = await colorSchemeService.getAllColorSchemes(
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: "Color schemes retrieved successfully",
      data: colorSchemes,
    });
  }
);

export const updateColorScheme = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { colorSchemeId } = req.params;
    const { name, description } = req.body;

    const colorScheme = await colorSchemeService.updateColorScheme(
      colorSchemeId,
      {
        name,
        description,
      }
    );

    res.status(200).json({
      success: true,
      message: "Color scheme updated successfully",
      data: colorScheme,
    });
  }
);

export const deleteColorScheme = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { colorSchemeId } = req.params;

    const colorScheme = await colorSchemeService.deleteColorScheme(
      colorSchemeId
    );

    res.status(200).json({
      success: true,
      message: "Color scheme deleted successfully",
      data: colorScheme,
    });
  }
);
