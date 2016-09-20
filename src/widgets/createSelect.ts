import createWidget from 'dojo-widgets/createWidget';
import { h, VNode } from 'maquette';

const createSelect = createWidget
	.mixin({
		mixin: {
			getChildrenNodes(): VNode[] {
				const selected: string = this.state.selected;
				const locales = [
					{ value: 'en', label: 'Default' },
					{ value: 'fr', label: 'French' },
					{ value: 'ar', label: 'Arabic' }
				];

				return locales.map((locale: { label: string, value: string }) => {
					const { label, value } = locale;
					return h('option', {
						innerHTML: label,
						value,
						selected: value === selected
					});
				});
			}
		}
	})
	.extend({
		tagName: 'select'
	});

export default createSelect;
