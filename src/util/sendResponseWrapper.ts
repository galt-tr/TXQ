
export const sendResponseWrapper = async (req: any, res: any, code: number, data: any) => {
  res.api.status = code || 200;
  res.status(res.api.status);
  res.api.result = data;
  if (req.query.envelope === 0) {
    res.send(data);
  } else {
    res.send(res.api);
  }
};
