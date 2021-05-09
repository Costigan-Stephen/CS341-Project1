const express = require('express');
const fs = require('fs');
const router = express.Router();

const requestHandler = (req, res) => {
    const method = req.method;
    const url = req.url;
    res.setHeader('Content-Type', 'text/html');
    if (url === "/users") {
        res.write('<html>');
        res.write('<head><title>Prove 01</title></head>');
        res.write('<body style="margin: 0">');
        res.write('<div style="padding: 20px; background-color: #404040; max-width: 100%; margin: 0; ">');
        res.write('<a style="color: white;" href="/">Back to Main</a>');
        res.write('</div>');
        res.write('<div style="padding: 0 20px; max-width: 100%; margin: 0; ">');
        res.write('<h1>Registered Users</h1>');
        res.write('<ul>');
        res.write('<li>PercyWeasley</li>');
        res.write('<li>FredWeasley</li>');
        res.write('<li>GeorgeWeasley</li>');
        res.write('<li>RonaldWeasley</li>');
        res.write('<li>GinnyWeasley</li>');

        function processLineByLine() {
            try {
                // read contents of the file
                const data = fs.readFileSync('users.txt', 'UTF-8');

                // split the contents by new line
                const lines = data.split(/\r?\n/);

                // print all lines
                lines.forEach((line) => {
                    res.write('<li>' + line + '</li>');
                    console.log(line);
                });
            } catch (err) {
                console.error(err);
            }
        }
        processLineByLine();
        res.write('</ul>');
        res.write('</div>');
        res.write('</body>');
        res.write('</html>');
        return res.end();
    } else if (url === "/create-user" && method === "POST") {
        const body = [];
        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1];
            console.log(parsedBody);
            fs.appendFile('users.txt', '\n' + message, (err) => {
                res.statusCode = 302; // redirect
                res.setHeader('Location', '/')
                return res.end();
            });
        });
    }
    // Default page, or '/'
    res.write('<html>');
    res.write('<head><title>Prove 01</title></head>');
    res.write('<body style="margin: 0;">');
    res.write('<div style="padding: 20px; background-color: #404040; max-width: 100%; margin: 0; ">');
    res.write('<a style="color: white;" href="/users">Show All Users</a>');
    res.write('</div>');
    res.write('<div style="padding: 0 20px; max-width: 100%; margin: 0; ">');
    res.write('<h1>Add a User</h1>');
    res.write('<form action="/create-user" method="POST"><input type="text" name="new-user"><button type="submit">Add User</button></form>');
    res.write('</div>');
    res.write('</body>');
    res.write('</html>');
    res.end();
}


//Output multiple with the syntax exports.syntax = function or constant
exports.hander = requestHandler;