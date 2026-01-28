import { Request, Response } from "express";

import { AuthRequest } from "../middleware/auth";

import * as deliveryManagementService from "../service/deliveryManagementService";

export const createOrUpdateDeliveryManagement = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const deliveryManagement =
    await deliveryManagementService.createOrUpdateDeliveryManagement(req.body);

  res.status(200).json({
    success: true,
    message: "Delivery management settings saved successfully",
    data: deliveryManagement,
  });
};

export const getDeliveryManagementByGroupId = async (
  req: Request | AuthRequest,
  res: Response,
): Promise<void> => {
  const { pincodeGroupId } = req.params;

  const deliveryManagement =
    await deliveryManagementService.getDeliveryManagementByGroupId(
      pincodeGroupId,
    );

  res.status(200).json({
    success: true,
    message: "Delivery management settings retrieved successfully",
    data: deliveryManagement,
  });
};

export const getAllDeliveryManagements = async (
  req: Request | AuthRequest,
  res: Response,
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await deliveryManagementService.getAllDeliveryManagements(
    page,
    limit,
  );

  res.status(200).json({
    success: true,
    message: "Delivery management settings retrieved successfully",
    data: result,
  });
};

export const deleteDeliveryManagement = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { pincodeGroupId } = req.params;

  const result =
    await deliveryManagementService.deleteDeliveryManagement(pincodeGroupId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};
