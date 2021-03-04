/**
 * WordPress dependencies
 */
import { BaseControl } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
import { F10 } from '@wordpress/keycodes';
import domReady from '@wordpress/dom-ready';

/**
 * External dependencies
 */
import { uniqueId } from 'lodash';

const { wp } = window;

function isTmceEmpty( editor ) {
	// When tinyMce is empty the content seems to be:
	// <p><br data-mce-bogus="1"></p>
	// avoid expensive checks for large documents
	const body = editor.getBody();

	if ( body.childNodes.length > 1 ) {
		return false;
	} else if ( body.childNodes.length === 0 ) {
		return true;
	}

	if ( body.childNodes[ 0 ].childNodes.length > 1 ) {
		return false;
	}

	return /^\n?$/.test( body.innerText || body.textContent );
}

class WysiwygControl extends Component {
	constructor( props ) {
		super( props );
		this.initialize = this.initialize.bind( this );
		this.onSetup = this.onSetup.bind( this );
		this.focus = this.focus.bind( this );
	}

	componentDidMount() {
		const { baseURL, suffix } = window.wpEditorL10n.tinymce;

		window.tinymce.EditorManager.overrideDefaults( {
			base_url: baseURL,
			suffix,
		} );

		domReady(() => this.initialize());
	}

	componentWillUnmount() {
		window.addEventListener( 'DOMContentLoaded', this.initialize );
		wp.oldEditor.remove( `editor-${ this.props.slug }` );
	}

	componentDidUpdate( prevProps ) {
		const {
			slug,
			value,
		} = this.props;

		const editor = window.tinymce.get( `editor-${ slug }` );

		if ( prevProps.value !== value ) {
			editor.setContent( value || '' );
		}
	}

	initialize() {
		const {
			settings = {
				plugins: "charmap,colorpicker,hr,lists,media,paste,tabfocus,textcolor,fullscreen,wordpress,wpautoresize,wpeditimage,wpemoji,wpgallery,wplink,wpdialogs,wptextpattern,wpview",
				external_plugins: [],
				classic_block_editor: true,
			},
			slug,
			toolbars = {
				toolbar1: "formatselect,wp_add_media,wp_adv,bold,italic,bullist,numlist,strikethrough,link",
				toolbar2: "pastetext,removeformat,charmap,undo,redo,wp_help",
				toolbar3: "",
				toolbar4: "",
			},
			formats = "Paragraph=p;Heading=h2;Subheading=h3",
		} = this.props;

		const editorSettings = {
			...settings,
			...toolbars,
			block_formats: formats,
		};

		wp.oldEditor.initialize( `editor-${ slug }`, {
			tinymce: {
				...editorSettings,
				inline: true,
				content_css: false,
				fixed_toolbar_container: `#toolbar-${ slug }`,
				setup: this.onSetup,
			},
		} );
	}

	onSetup( editor ) {
		const {
			onChange,
			value,
		} = this.props;

		const { ref } = this;
		let bookmark;

		this.editor = editor;

		if ( value ) {
			editor.on( 'loadContent', () => editor.setContent( value ) );
		}

		editor.on( 'blur', () => {
			bookmark = editor.selection.getBookmark( 2, true );

			onChange( editor.getContent() );

			editor.once( 'focus', () => {
				if ( bookmark ) {
					editor.selection.moveToBookmark( bookmark );
				}
			} );

			return false;
		} );

		editor.on( 'mousedown touchstart', () => {
			bookmark = null;
		} );

		editor.on( 'keydown', ( event ) => {
			const { altKey } = event;

			/*
			 * Prevent Mousetrap from kicking in: TinyMCE already uses its own
			 * `alt+f10` shortcut to focus its toolbar.
			 */
			if ( altKey && event.keyCode === F10 ) {
				event.stopPropagation();
			}
		} );

		editor.on( 'init', () => {
			const rootNode = this.editor.getBody();

			// Create the toolbar by refocussing the editor.
			if ( document.activeElement === rootNode ) {
				rootNode.blur();
				this.editor.focus();
			}
		} );
	}

	focus() {
		if ( this.editor ) {
			this.editor.focus();
		}
	}

	onToolbarKeyDown( event ) {
		// Prevent WritingFlow from kicking in and allow arrows navigation on the toolbar.
		event.stopPropagation();

		// Prevent Mousetrap from moving focus to the top toolbar when pressing `alt+f10` on this block toolbar.
		event.nativeEvent.stopImmediatePropagation();
	}

	render() {
		const { slug } = this.props;

		// Disable reasons:
		//
		// jsx-a11y/no-static-element-interactions
		//  - the toolbar itself is non-interactive, but must capture events
		//    from the KeyboardShortcuts component to stop their propagation.

		/* eslint-disable jsx-a11y/no-static-element-interactions */
		return (
			<BaseControl { ...this.props }>
				<div className="wysiwyg-control">
					<div
						key="toolbar"
						id={ `toolbar-${ slug }` }
						ref={ ( ref ) => this.ref = ref }
						className="block-library-classic__toolbar wysiwyg-control__toolbar"
						onClick={ this.focus }
						data-placeholder={ __( 'Click to edit' ) }
						onKeyDown={ this.onToolbarKeyDown }
					/>
					<div
						key="editor"
						id={ `editor-${ slug }` }
						className="wp-block-freeform block-library-rich-text__tinymce wysiwyg-control__body"
					/>
				</div>
			</BaseControl>
		);
		/* eslint-enable jsx-a11y/no-static-element-interactions */
	}
}

export default WysiwygControl;
