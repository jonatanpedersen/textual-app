export function makeErrorMiddleware () {
  return async function errorMiddleware (err, req, res, next) {
    res.status(500).send(err);
  };
}
