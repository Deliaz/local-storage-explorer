const chai = require('chai');
const expect = chai.expect;
const PanelClass = require('../js/panel');

describe('Test static methods of WebStorageExplorer class', () => {
	describe('tryParseJSON', () => {
		it('should return an empty object for "{}"', () => {
			const result = PanelClass.tryParseJSON('{}');
			expect(JSON.stringify(result)).to.be.equal('{}');
		});

		it('should parse usual JSON successfully', () => {
			const result = PanelClass.tryParseJSON('{ "a" : 123, "b" : true, "c": "abc"}');
			expect(result).to.be.deep.equal({a: 123, b: true, c: 'abc'});
		});

		it('should return null for broken JSON', () => {
			const result = PanelClass.tryParseJSON('{ a : 123, b : true, c: "abc"}'); //no quotes
			expect(result).to.be.a.null;
		});

		it('should return null for string', () => {
			const result = PanelClass.tryParseJSON('hello');
			expect(result).to.be.a.null;
		});

		it('should return number for number', () => {
			const result = PanelClass.tryParseJSON(123);
			expect(result).to.be.equal(123);
		});

		it('should return null for null', () => {
			const result = PanelClass.tryParseJSON(null);
			expect(result).to.be.null;
		});

		it('should return true for true', () => {
			const result = PanelClass.tryParseJSON(true);
			expect(result).to.be.true;
		});

		it('should return false for false', () => {
			const result = PanelClass.tryParseJSON(true);
			expect(result).to.be.true;
		});
	});

	describe('guessType', () => {
		it('should return object for {}', () => {
			const result = PanelClass.guessType({});
			expect(result).to.be.equal('object');
		});

		it('should return null for null', () => {
			const result = PanelClass.guessType(null);
			expect(result).to.be.equal('null');
		});

		it('should return array for []', () => {
			const result = PanelClass.guessType([]);
			expect(result).to.be.equal('array');
		});

		it('should return boolean for true', () => {
			const result = PanelClass.guessType(true);
			expect(result).to.be.equal('boolean');
		});

		it('should return boolean for false', () => {
			const result = PanelClass.guessType(false);
			expect(result).to.be.equal('boolean');
		});

		it('should return string for normal string', () => {
			const result = PanelClass.guessType('hello');
			expect(result).to.be.equal('string');
		});

		it('should return string for empty string', () => {
			const result = PanelClass.guessType('');
			expect(result).to.be.equal('string');
		});

		it('should return number for a number', () => {
			const result = PanelClass.guessType(123);
			expect(result).to.be.equal('number');
		});

		it('should return number for a string number', () => {
			const result = PanelClass.guessType('321');
			expect(result).to.be.equal('number');
		});

		it('should return string for string "111a"', () => {
			const result = PanelClass.guessType('111a');
			expect(result).to.be.equal('string');
		});

		it('should return other for NaN', () => {
			const result = PanelClass.guessType(NaN);
			expect(result).to.be.equal('other');
		});

		it('should return other for Infinity', () => {
			const result = PanelClass.guessType(Infinity);
			expect(result).to.be.equal('other');
		});

		it('should return other for a function', () => {
			const result = PanelClass.guessType(() => {
			});
			expect(result).to.be.equal('other');
		});
	});
});