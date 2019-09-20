# WysiwygControl

This repo provides a WYSIWYG control for the WordPress block editor, powered by TinyMCE.

It is a lightly adapted version of the WordPress "Classic" block, designed to be used as a control, with values persisted to a block's attributes or post meta, rather than a standalone block itself.

<img width="381" alt="Screen Shot 2019-09-20 at 9 06 14 AM" src="https://user-images.githubusercontent.com/1231306/65329177-f2abf600-db85-11e9-9455-03fd1a80c919.png">

## Usage

The repo is not designed to be used out of the box, but rather as a starting point for your own integration. As such, you can't "install" it via `npm` or another package manager; instead, you should copy the files to your project.

Once you build and bundle the JS and CSS, you can use the control in your project like so:

```jsx
<WysiwygControl
	label={ __( 'Description' ) }
	slug={ `${ clientId }-description` }
	onChange={ ( value ) => setAttributes( { description: value } ) }
	value={ description }
	toolbars={ {
		toolbar1: 'bold,italic,bullist,numlist,link,removeformat',
		toolbar2: '',
		toolbar3: '',
		toolbar4: '',
	} }
/>
```

> **Important Note:** Every WysiwygControl in your block or plugin _must_ have a unique slug. To prevent slugs from conflicting across multiple block instances, I highly recommend including your block's `clientId` (which is available as a prop on your edit component) in the slug, as in the example above.

## About Tomodomo

Tomodomo is a software studio for magazine publishers and enterprise WordPress users. We build custom technology to speed up your editorial workflow, engage your readers, and build sustainable subscription revenue for your business.

Learn more at [tomodomo.co](https://tomodomo.co) or email us: [hello@tomodomo.co](mailto:hello@tomodomo.co)

## License & Conduct

This project is licensed under the terms of the GPLv2 License, included in `LICENSE`.

All open source Tomodomo projects follow a strict code of conduct, included in `CODEOFCONDUCT.md`. We ask that all contributors adhere to the standards and guidelines in that document.

Thank you!
