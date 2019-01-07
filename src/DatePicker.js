import {h} from './h.js'
import './DatePicker.less';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NBSP = '\u00a0'; // unicode for entity &nbsp;

function later(fn) {
	setTimeout(fn, 10);
}

function genId() {
	return Math.random().toString(36).substr(2, 9);
}

function pad(d) {
	return ('0' + d).substr(-2);
}

function formatDate(dt, formatStr) {
	var yyyy = dt.getFullYear();
	var mm = pad(dt.getMonth() + 1);
	var dd = pad(dt.getDate());
	return formatStr.replace('YYYY', yyyy).replace('MM', mm).replace('DD', dd);
}

function compareDates(a, b) {
	var s1 = formatDate(a, 'YYYY-MM-DD');
	var s2 = formatDate(b, 'YYYY-MM-DD');
	return (s1 > s2) ? 1 : (s1 < s2) ? -1 : 0;
}

function isSameDate(a, b) {
	return compareDates(a, b) === 0;
	// return (one.getFullYear() === two.getFullYear()) && (one.getMonth() === two.getMonth()) && (one.getDate() === two.getDate());
}

function findParent(el, fn) {
	var ptr = el;
	while (ptr && ptr != document) {
		if (fn(ptr)) {
			return ptr;
		}
		ptr = ptr.parentNode;
	}
	return null;
}

// console.log('compare GT', compareDates(new Date(2016, 7, 30), new Date(2016, 7, 28)));
// console.log('compare LT', compareDates(new Date(2016, 7, 30), new Date(2016, 8, 28)));
// console.log('compare EQ', compareDates(new Date(2016, 7, 21), new Date(2016, 7, 21)));


// console.log('compare GT', compareDates(new Date(2016, 7, 30), new Date(2016, 7, 28)));
// console.log('compare LT', compareDates(new Date(2016, 7, 30), new Date(2016, 8, 28)));
// console.log('compare EQ', compareDates(new Date(2016, 7, 21), new Date(2016, 7, 21)));


export class DatePicker extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.getStateFromProps(this.props);

		this.onDocumentClick = this.onDocumentClick.bind(this)
		// this.show = this.show.bind(this)
		// this.hide = this.hide.bind(this)
		this.onInputFocus = this.onInputFocus.bind(this)
		this.onToggle = this.onToggle.bind(this)
		this.onClear = this.onClear.bind(this)
		this.onMove = this.onMove.bind(this)
		// this.choose = this.choose.bind(this)
	}

	getStateFromProps(props) {
		var dt = props.value ? props.value : new Date();
		var year = dt.getFullYear();
		var month = dt.getMonth() + 1;
		var state = {
			show: false,
			year,
			month
		};
		// console.log('getStateFromProps', state, this.props.id);
		return state;
	}

	componentWillMount() {
		if (!this.props.id) {
			this.setState({id: 'dt-picker-' + genId()});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (!this.props.showCalendarStatic) {
			if (this.props.value === nextProps.value) return;
			if (this.props.value && nextProps.value && isSameDate(this.props.value, nextProps.value)) return;
		}
		// console.log('componentWillReceiveProps begin', (this.props.id || this.state.id), this.props.value, nextProps.value);
		var state = this.getStateFromProps(nextProps);
		this.setState(state);
		// console.log('componentWillReceiveProps end', (this.props.id || this.state.id));
	}

	componentDidMount() {
		if (this.props.showCalendarStatic) return;
		// document.addEventListener('click', this.onDocumentClick);
	}

	componentWillUnmount() {
		if (this.props.showCalendarStatic) return;
		// document.removeEventListener('click', this.onDocumentClick);
	}

	onDocumentClick(e) {
		var id = this.props.id || this.state.id;
		var rootEl = document.getElementById(id);
		var inside = !!findParent(e.target, el => el === rootEl);
		// console.log(id, 'onDocumentClick inside:', inside);
		if (!inside) {
			this.hide();
		}
	}

	show() {
		if (this.props.showCalendarStatic) return;
		if (this.props.value) {
			var dt = this.props.value;
			var year = dt.getFullYear();
			var month = dt.getMonth() + 1;
			this.setState({
				year,
				month
			});
		}
		document.addEventListener('click', this.onDocumentClick);
		this.setState({show: true});
	}

	hide() {
		if (this.props.showCalendarStatic) return;
		document.removeEventListener('click', this.onDocumentClick);
		this.setState({show: false});
	}

	onInputFocus(e) {
		this.show();
	}

	onToggle() {
		this.state.show ? this.hide() : this.show();
	}

	onClear() {
		this.setState({value: null});
		this.props.onChange(null, this.props.id);
	}

	onMove(year, month) {
		later(() => this.setState({year, month}));
	};

	choose(day) {
		if (!day) return
		var dt = new Date(this.state.year, this.state.month - 1, day);
		this.hide();
		this.props.onChange(dt, this.props.id);
	}

	chooser(val) {
		return e => this.choose(val);
	};

	formatValue() {
		if (!this.props.value) return '';
		return formatDate(this.props.value, this.props.displayFormat);
	};

	renderTable(year, month) {
		var grid = [];
		var mon = month - 1;
		var i, j, k, d;
		for (i = 0; i < 6; i += 1) {
			for (j = 0; j < 7; j += 1) {
				k = i * 7 + j;
				grid[k] = NBSP;
			}
		}

		var firstDate = new Date(year, mon, 1);
		var firstDay = firstDate.getDay();
		var lday = 32;
		var lastDate;
		do {
			lday -= 1;
			lastDate = new Date(year, mon, lday);
		} while (lastDate.getMonth() !== mon)

		for (d = 1, k = firstDay; d <= lastDate.getDate(); d += 1, k += 1) {
			grid[k] = d;
		}
		// console.log('grid', year, month, grid);

		var selDate = this.props.value ? this.props.value.getDate() : 0;
		var rows = [];
		for (i = 0; i < 6; i += 1) {
			var cols = [];
			for (j = 0; j < 7; j += 1) {
				k = i * 7 + j;
				var val = grid[k];
				var dt;
				var css = [];
				if (val !== NBSP) {
					dt = new Date(this.state.year, this.state.month - 1, val);
					css.push('enabled');
					if (this.props.value && isSameDate(dt, this.props.value)) css.push('selected');
				}
				cols[j] = h('td', {key: 'c' + j, className: css.join(' '), onClick: this.chooser(val)}, val);
			}
			rows.push(
				h('tr', {key: 'r' + i}, cols)
			);
		}

		return h('table', {className: 'date-picker__calendar'},
			h('thead', null,
				h('tr', null,
					h('th', null, 'S'),
					h('th', null, 'M'),
					h('th', null, 'T'),
					h('th', null, 'W'),
					h('th', null, 'T'),
					h('th', null, 'F'),
					h('th', null, 'S')
				)
			),
			h('tbody', {onClick: this.onDayClick}, rows)
		);
	}


	render() {
		var state = this.state;
		var props = this.props;
		var id = props.id || state.id;

		var calStatic = props.showCalendarStatic ? 'static' : '';
		var calHide = props.showCalendarStatic ? '' : state.show ? '' : 'hide';
		var clear = props.clearable && props.value ? h('span', {className: 'date-picker__input-icox', onClick: this.onClear}, '\u2715') : null;

		return h('div', {id: id, className: 'date-picker ' + props.className, style: props.style},
			h('div', {className: 'date-picker__input'},
				h('input', {className: 'date-picker__input-txt', type: 'text', value: this.formatValue(),
					placeholder: props.placeholder, onFocus: this.onInputFocus}),
				clear
			),
			h('div', {className: ['date-picker__panel ', calHide, calStatic].join(' ') },
				h('div', {className: 'date-picker__nav'},
					h('span', {className: 'date-picker__nav-ico fa fa-angle-double-left',
						onClick: e => this.onMove(state.year - 1, state.month)}),
					h('span', {className: 'date-picker__nav-ico fa fa-angle-left',
						onClick: e => this.onMove(state.year, state.month - 1)}),
					h('span', {className: 'date-picker__nav-mnyr'}, MONTH_NAMES[state.month], ' ', state.year),
					h('span', {className: 'date-picker__nav-ico fa fa-angle-right',
						onClick: e => this.onMove(state.year, state.month + 1)}),
					h('span', {className: 'date-picker__nav-ico fa fa-angle-double-right',
						onClick: e => this.onMove(state.year + 1, state.month)})
				),
				this.renderTable(state.year, state.month)
			)
		);
	}
};

DatePicker.defaultProps = {
	value: null,
	style: null,
	className: '',
	displayFormat: 'DD-MM-YYYY',
	placeholder: 'Select...',
	clearable: true,
	showCalendarStatic: false,
	onChange: function(){}
};
