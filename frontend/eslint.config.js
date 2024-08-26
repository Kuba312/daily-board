// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
	{
		files: ['**/*.ts'],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.stylistic,
			...angular.configs.tsRecommended,
		],
		processor: angular.processInlineTemplates,
		rules: {
			'@angular-eslint/component-selector': [
				'error',
				{
					type: ['element', 'attribute'],
					prefix: ['lib-kzm5', 'app', 'kzm-lib', 'kzm'],
					style: 'kebab-case',
				},
			],
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: ['lib-kzm5', 'app', 'kzm-lib', 'kzm'],
					style: 'camelCase',
				},
			],
			'@angular-eslint/use-lifecycle-interface': 'off',
			'@typescript-eslint/explicit-member-accessibility': [
				'off',
				{
					accessibility: 'explicit',
				},
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-inferrable-types': 'off',
			'arrow-parens': ['off', 'always'],
			'import/order': 'off',
			'max-len': [
				'error',
				{
					code: 120,
				},
			],
			'no-bitwise': 'off',
			'no-duplicate-imports': 'error',
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'default',
					format: ['camelCase', 'UPPER_CASE'],
				},
				{
					selector: ['class', 'interface', 'typeAlias'],
					format: ['PascalCase'],
					leadingUnderscore: 'allow',
				},
				{
					selector: 'parameterProperty',
					format: ['camelCase', 'UPPER_CASE'],
					leadingUnderscore: 'allow',
				},
				{
					selector: ['method', 'function', 'parameter'],
					format: ['camelCase'],
					leadingUnderscore: 'allow',
				},
				{
					selector: 'memberLike',
					modifiers: ['private'],
					format: ['camelCase'],
					leadingUnderscore: 'require',
				},
				{
					selector: ['enum', 'enumMember'],
					format: ['PascalCase'],
				},
				{
					selector: 'property',
					format: ['camelCase', 'UPPER_CASE'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow',
				},
				{
					selector: 'import',
					format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow',
				},
			],
			'no-underscore-dangle': 'off',
			'@typescript-eslint/member-ordering': 'off',
			'comma-dangle': [
				'error',
				{
					arrays: 'always-multiline',
					objects: 'always-multiline',
					imports: 'always-multiline',
					exports: 'always-multiline',
					functions: 'always-multiline',
				},
			],
			eqeqeq: [
				'error',
				'always',
				{
					null: 'ignore',
				},
			],
			'arrow-body-style': 'off',
			'prefer-arrow/prefer-arrow-functions': 'off',
			'@typescript-eslint/ban-types': 'off',
			'no-shadow': 'off',
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowExpressions: true,
				},
			],
			'object-curly-spacing': [
				'error',
				'always',
				{
					arraysInObjects: true,
					objectsInObjects: true,
				},
			],
			'array-bracket-spacing': ['error', 'never'],
			'space-before-function-paren': [
				'error',
				{
					anonymous: 'always',
					named: 'never',
					asyncArrow: 'always',
				},
			],
			'no-console': [
				'error',
				{
					allow: ['warn', 'error'],
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					vars: 'all',
					args: 'after-used',
					ignoreRestSiblings: true,
				},
			],
			'no-undef': 'off',
			'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
			'no-case-declarations': 'off',
			'no-empty': 'error',
			'no-duplicate-case': 'error',
			'no-inner-declarations': 'error',
			'no-import-assign': 'error',
			'no-loss-of-precision': 'error',
			'no-sparse-arrays': 'error',
			'no-template-curly-in-string': 'error',
			'no-unreachable': 'error',
			'no-unsafe-finally': 'error',
			curly: 'error',
			'no-alert': 'error',
			'no-constructor-return': 'error',
			'no-empty-function': [
				'error',
				{
					allow: ['constructors', 'arrowFunctions'],
				},
			],
			'no-multi-spaces': 'error',
			'no-multiple-empty-lines': [
				'error',
				{
					max: 1,
					maxEOF: 1,
					maxBOF: 0,
				},
			],
			'padding-line-between-statements': [
				'error',
				{
					blankLine: 'always',
					prev: '*',
					next: [
						'block',
						'block-like',
						'cjs-export',
						'class',
						'export',
						'import',
						'let',
						'var',
					],
				},
				{
					blankLine: 'always',
					prev: ['block', 'block-like', 'cjs-export', 'class', 'export', 'import'],
					next: '*',
				},
				{
					blankLine: 'any',
					prev: ['const', 'let', 'var'],
					next: ['const', 'let', 'var'],
				},
				{
					blankLine: 'any',
					prev: ['export', 'import'],
					next: ['export', 'import'],
				},
			],
			'@typescript-eslint/typedef': [
				'warn',
				{
					arrayDestructuring: false,
					arrowParameter: false,
					memberVariableDeclaration: true,
					objectDestructuring: false,
					parameter: true,
					propertyDeclaration: true,
					variableDeclaration: false,
					variableDeclarationIgnoreFunction: false,
				},
			],
		},
	},
	{
		files: ['**/*.html'],
		extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
		rules: {
			'@angular-eslint/template/click-events-have-key-events': 'off',
			'@angular-eslint/template/interactive-supports-focus': 'off',
			"@angular-eslint/template/elements-content": "off"
		},
	}
);
