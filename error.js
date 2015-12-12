export function makeErrorMiddleware () {
  return async function errorMiddleware (err, req, res, next) {
    console.log(err, err.stack);
    res.status(500).send(err);
  };
}
