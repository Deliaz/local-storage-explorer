const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

describe('manifest.json & package.json', () => {
	it('manifest.json should be valid JSON file', () => {
		const manifestFile = JSON.parse(fs.readFileSync(`${__dirname}/../manifest.json`, 'utf-8'));
		expect(manifestFile).to.be.an('object');
	});

	it('package.json should be valid JSON file', () => {
		const packageFile = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, 'utf-8'));
		expect(packageFile).to.be.an('object');
	});

	it('package.json should contain same version number as manifest.json', () => {
		const manifestFile = JSON.parse(fs.readFileSync(`${__dirname}/../manifest.json`, 'utf-8'));
		const packageFile = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, 'utf-8'));

		expect(packageFile.version).to.be.equal(manifestFile.version);
	});
});
