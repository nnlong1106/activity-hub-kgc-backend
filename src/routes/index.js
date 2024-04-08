const usersRouter = require('./users');
const studentsRouter = require('./students');
const studentClassesRouter = require('./studentClasses');
const authenticateRouter = require('./authenticate');
const activitiesRouter = require('./activities');
const participationsRouter = require('./participations');

function route(app) {
    //done
    app.use('/authenticate', authenticateRouter);
    app.use('/api/users', usersRouter);
    //done
    app.use('/api/classes', studentClassesRouter);
    //done
    app.use('/api/students', studentsRouter);
    //done
    app.use('/api/activities', activitiesRouter);
    app.use('/api/participations', participationsRouter);
}

module.exports = route;
