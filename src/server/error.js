export function makeErrorMiddleware () {
  return async function errorMiddleware (err, req, res, next) {
    console.error(err);
    res.status(500).send(err);
  };
}
