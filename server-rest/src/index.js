import express from "express";
import cors from 'cors';
import bodyParser from "body-parser";

const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let userId = 1;
let sampleData = [];

app.get("/", function (req, res) {
    res.status(200).send({ message: 'Welcome to restful API' });
});

app.get("/users", function (req, res) {
    res.status(200).send(sampleData);
});

app.post("/user/create", function ({ body: { name } }, res) {
    const findUser = sampleData.filter(el => el.name === name);

    if (findUser.length > 0) {
        res.status(400).send({
            success: false,
            message: 'Tên người dùng đã tồn tại'
        });
    } else {
        sampleData.push({ id: userId, name });
        userId = ++userId;

        res.status(200).send({
            success: true,
            data: { id: userId - 1, name }
        });
    }
});

app.post("/user/edit", function ({ body: { id, name } }, res) {
    const findUser = sampleData.filter(el => el.name === name && el.id !== id);

    if (findUser.length > 0) {
        res.status(400).send({
            success: false,
            message: 'Tên người dùng đã tồn tại'
        });
    } else {
        sampleData.forEach((ele, index) => {
            if (ele.id === id) {
                sampleData[index].name = name;
            }
        });

        res.status(200).send({
            success: true,
            data: { id, name }
        });
    }
});

app.post("/user/delete", function ({ body: { id } }, res) {
    const deleteUser = sampleData.filter(el => el.id === id);
    sampleData = sampleData.filter(el => el.id !== id);

    res.status(200).send({
        success: true,
        data: { ...deleteUser[0] }
    });
});

const server = app.listen(8001, function () {
    console.log(`REST Server listening on http://localhost:${server.address().port}`);
});