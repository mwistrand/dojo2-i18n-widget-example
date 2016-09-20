import i18n from 'dojo-i18n/main';
import projector from 'dojo-widgets/projector';
import createGreeting from './widgets/createGreeting';
import createOrderedList from './widgets/createOrderedList';
import createSelect from './widgets/createSelect';

const rootLocaleSelect = createSelect({
	listeners: {
		change(this: any, event: Event) {
			const target: any = event.target;
			const locale = target.options[target.selectedIndex].value;
			rootLocaleSelect.setState({ locale });
			i18n.switchLocale({ locale });
		}
	}
});
const greeting = createGreeting();
const greetings = createOrderedList({
	locale: {
		direction: 'rtl',
		locale: 'ar'
	}
});
const nestedLocaleSelect = createSelect({
	state: {
		selected: 'ar'
	},
	listeners: {
		change(this: any, event: Event) {
			const target: any = event.target;
			const locale = target.options[target.selectedIndex].value;
			nestedLocaleSelect.setState({ locale });
			greetings.setState({ locale: { locale }});
		}
	}
});
projector.append(rootLocaleSelect);
projector.append(greeting);
projector.append(nestedLocaleSelect);
projector.append(greetings);
projector.attach();
