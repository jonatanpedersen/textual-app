if (/\bin\/_mocha/.test(process.argv[1])) {
    require("babel-core/register")({
        only: /\.spec\.js$/
    });
} else {
    require("babel-core/register");
}
