#!/usr/bin/env node
const cp = require('child_process');
const version = require('../package.json').version;

cp.execSync(`git tag v${version}`, {stdio: 'inherit'});
cp.execSync(`git push origin v${version}`, {stdio: 'inherit'});
