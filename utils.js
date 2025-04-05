export function getReqBody(req) {
    let body = [];
    return new Promise((resolve, reject) => {
        req.on('data', function (chunck) {
            body.push(chunck);
        })
        .on('end', () => {
            body = Buffer.concat(body).toString();
            // at this point, `body` has the entire request body stored in it as a string
            resolve(JSON.parse(body))

        })
        .on('error', (e) => {
            reject(e)
        })
    })
}