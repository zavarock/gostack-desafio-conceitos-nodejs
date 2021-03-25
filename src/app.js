const express = require("express");
const cors = require("cors");

const {v4: uuid, validate: isUuid} = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function checkRepositoryId(request, response, next) {
    const {id} = request.params;
    if (!isUuid(id)) {
        return response.status(400).json({
            message: 'Invalid repository ID.'
        });
    }

    const repositoryIndex = repositories.findIndex(repository => id === repository.id);
    if (repositoryIndex < 0) {
        return response.status(404).json({
            message: 'Repository not found.'
        });
    }

    // In Express.js, response.locals is used when we need to pass custom variables to the next middleware.
    response.locals.repositoryIndex = repositoryIndex;

    return next();
}

app.use("/repositories/:id", checkRepositoryId);

app.get("/repositories", (request, response) => {
    return response.json(repositories);
});

app.post("/repositories", (request, response) => {
    const {title, url, techs} = request.body;
    const newRepository = {
        id: uuid(),
        title,
        url,
        techs,
        likes: 0
    };

    repositories.push(newRepository);

    return response.status(201).json(newRepository);
});

app.put("/repositories/:id", (request, response) => {
    const repositoryIndex = response.locals.repositoryIndex;
    const repository = repositories[repositoryIndex];

    const {title, url, techs} = request.body;

    repository.title = title;
    repository.url = url;
    repository.techs = techs;

    repositories[repositoryIndex] = repository;

    return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
    repositories.splice(response.locals.repositoryIndex, 1);

    return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
    const repositoryIndex = response.locals.repositoryIndex;
    const repository = repositories[repositoryIndex];

    repository.likes += 1;

    repositories[repositoryIndex] = repository;

    return response.status(201).json(repository);
});

module.exports = app;