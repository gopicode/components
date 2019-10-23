import {h} from './h.js'
import {Button} from './Button.js'
import {DatePicker} from './DatePicker.js'
import {ComboBox} from './ComboBox.jsx'
// import {ImageCrop} from './ImageCrop.jsx'
import {ImageCrop} from './ImageCropRaw.jsx'
import {JsonEdit} from './JsonEdit.jsx'

import cities from './cities.js';
import countries from './countries.js';
import products from './products.json';

const PHOTO = '/sample1.jpg';
// const PHOTO = 'http://jcrop-cdn.tapmodo.com/v0.9.10/demos/demo_files/pool.jpg';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			date1: new Date(),
			date2: null,
			cityValue: '',
			cityItem: null,
			cityList: cities,
			country: {value: '', item: null, list: countries}
		};
		this.onChange = this.onChange.bind(this);
		this.onCityChange = this.onCityChange.bind(this);
		this.onCitySelect = this.onCitySelect.bind(this);
		this.onCountryChange = this.onCountryChange.bind(this);
		this.onCountrySelect = this.onCountrySelect.bind(this);
		this.onProductsChange = this.onProductsChange.bind(this);
	}

	onChange(value, id) {
		this.setState({[id]: value});
	}

	onCityChange(value, id) {
		const list = cities.filter(item => item.toLowerCase().startsWith(value.toLowerCase()))
		this.setState({cityList: list, cityValue: value});
	}

	onCitySelect(item, id) {
		this.setState({cityItem: item, cityValue: item.toString()});
	}

	onCountryChange(value, id) {
		const list = countries.filter(item => item.name.toLowerCase().startsWith(value.toLowerCase()))
		this.setState({country: {...this.state.country, list, value: value}});
	}

	onCountrySelect(item, id) {
		this.setState({country: {...this.state.country, item, value: item.name}});
	}

	onProductsChange(value, id) {
		// this.setState({[id]: value});
		console.log('onProductsChange', value);
	}

	render() {
		let content;
		switch (location.pathname) {
			case "/image-cropper":
				content = h('div', {className: 'photo'},
					h(ImageCrop, {id: 'photo', src: PHOTO, onChange: val => this.setState({photo: val})})
				)
				break;
			case "/json-editor":
				content = h(JsonEdit, {value: products, onChange: this.onProductsChange})
				break;
			default:
				content = h('form', null,
				h('table', null,
					h('tr', null,
						h('td', null, 'From'),
						h('td', null, h(DatePicker, {id: 'date1', value: this.state.date1, zIndex: 4,
							onChange: this.onChange}))
					),
					h('tr', null,
						h('td', null, 'Upto'),
						h('td', null, h(DatePicker, {id: 'date2', value: this.state.date2, zIndex: 3,
							displayFormat: 'DD-MMM-YYYY',
							onChange: val => this.setState({date2: val})}))
					),
					h('tr', null,
						h('td', null, 'City'),
						h('td', null, h(ComboBox, {id: 'city', value: this.state.cityValue, zIndex: 2,
							list: this.state.cityList,
							onChange: this.onCityChange,
							onSelect: this.onCitySelect}))
					),
					h('tr', null,
						h('td', null, 'Country'),
						h('td', null, h(ComboBox, {id: 'country', value: this.state.country.value, zIndex: 1,
							list: this.state.country.list,
							itemFormat: item => `${item.name} - ${item.code}`,
							onChange: this.onCountryChange,
							onSelect: this.onCountrySelect}))
					),
					h('tr', null,
						h('td', null, ''),
						h('td', null, h(Button, {type: 'button'}, 'Send'))
					)
				)
			)
		}
		return h('div', null,
			h('header', {className: 'header'}, 'This is the header'),
			content,
			h('footer', {className: 'footer'}, 'This is the footer')
		);
	}
}

// render the application
console.log('React.version', React.version);
ReactDOM.render(h(App), document.getElementById('root'));
