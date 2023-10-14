const REQUEST_TIMEOUT = 5;


/** Returns a promise from timeout (promisify normal timeout function)
 * @param {*} seconds seconds when promise will be rejected after
 * @returns Promise (rejected by default on timeout)
 */
function timeout (seconds) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(Error(`Request timed out. Please try again later...`));
        }, seconds * 1_000);
    });
}


/** Helper function to be used to run fetch method on post or get request
 * @param {*} url URL to send request to
 * @param {*} uploadData data to be send to API (on post request)
 * @returns data received from API endpoint
 */
async function AJAX (url, uploadData = undefined) {
    try {
        const requestPromise = uploadData
            ? fetch(url, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(uploadData)
            })
            : fetch(url, {
                method: 'get'
            });

        const response = await Promise.race([requestPromise, timeout(REQUEST_TIMEOUT)]);
        const data = await response.json();

        if (!response.ok) throw Error(data.message);

        return data;
    } catch (error) {
        throw error.message;
    }
}


// exporting methods on this module
export default { timeout, AJAX };