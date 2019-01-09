import {h} from './h.js'
import {Button} from './Button.js'
import {DatePicker} from './DatePicker.js'
import {ComboBox} from './ComboBox.jsx'

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			date1: new Date(),
			date2: null
		};
		this.onChange = this.onChange.bind(this);
	}

	onChange(value, id) {
		this.setState({[id]: value});
	}

	render() {
		return h('div', null,
			h('header', {className: 'header'}, 'This is the header'),
			h('form', null,
				h('table', null,
					h('tr', null,
						h('td', null, 'Date1'),
						h('td', null, h(DatePicker, {id: 'date1', value: this.state.date1, onChange: this.onChange}))
					),
					h('tr', null,
						h('td', null, 'Date2'),
						h('td', null, h(DatePicker, {id: 'date2', value: this.state.date2, displayFormat: 'DD-MMM-YYYY',
							onChange: val => this.setState({date2: val})}))
					),
					h('tr', null,
						h('td', null, ''),
						h('td', null, h(Button, {type: 'button'}, 'Send'))
					)
				)
			),
			h('footer', {className: 'footer'}, 'This is the footer')
		);
	}
}

// render the application
console.log('React.version', React.version);
ReactDOM.render(h(App), document.getElementById('root'));
