export const successResponse = (data: any, status = 200) => ({
  success: true,
  data,
  status,
});

export const errorResponse = (error: string, status = 500) => ({
  success: false,
  error,
  status,
});
