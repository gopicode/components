import './JsonEdit2.less';
import PropTypes from 'prop-types';

const TYPE_NULL = 'null';
const TYPE_ARRAY = 'array';
const TYPE_OBJECT = 'object';
const TYPE_BOOLEAN = 'boolean';
const TYPE_NUMBER = 'number';
const TYPE_STRING = 'string';
const TYPE_MARKER = '__mark';

const MARKS = {
	"colon": ":",
	"comma": ",",
	"quote": '"',
	"array": {beg: "[", end: "]"},
	"object": {beg: "{", end: "}"}
}
const MARKS_LIST = [MARKS.array.beg, MARKS.array.end, MARKS.object.beg, MARKS.object.end];

function getType(val) {
	if (val === null) return TYPE_NULL;
	if (Array.isArray(val)) return TYPE_ARRAY;
	if (MARKS_LIST.includes(val)) return TYPE_MARKER;
	return typeof(val);
}

function typecast(val) {
	val = val.trim()
	if (/^null$/i.test(val)) return null;
	if (/^true$/i.test(val)) return true;
	if (/^false$/i.test(val)) return false;
	if (/^\d+$/.test(val)) return Number(val);
	if (/^\d+\.\d+$/.test(val)) return Number(val);
	if (/^\{\}$/i.test(val)) return {};
	if (/^\[\]$/i.test(val)) return [];
	return String(val);
}

function joinPath(jpath, key) {
	return jpath ? [jpath, key].join('.') : key;
}

function editLine(e) {
	const $el = e.currentTarget;
	const $line = $el.closest('.json-line');
	$line.classList.add('edit');
}

function resetLine(e) {
	const $el = e.currentTarget;
	const $line = $el.closest('.json-line');
	$line.classList.remove('edit');
}

function updateLine(e, props) {
	const {name, index, update, ptype} = props;
	e.preventDefault();
	const $form = e.currentTarget;
	const $line = $form.closest('.json-line');
	$line.classList.remove('edit');

	const $inputName = $form.elements.name;
	const $inputValue = $form.elements.value;
	const newName = $inputName ? $inputName.value.trim() : '';
	const newValue = $inputValue ? $inputValue.value.trim() : '';

	console.log('update', newName, newValue, name);
	if (ptype == TYPE_ARRAY) {
		update(newValue, index);
	} else if (ptype == TYPE_OBJECT) {
		update(newName, newValue, index);
	}
}

function JsonLine(props) {
	const {name, val, comma, isNull} = props;
	const quote = getType(val) === TYPE_STRING ? MARKS.quote : '';
	return (
		<div className="json-line">
		<form onSubmit={e => updateLine(e, props)}>
			{name && <span>
				<span className="json-name" onClick={editLine}>{name}</span>
				<input type="text" name="name" defaultValue={name} autoFocus={true} />
				{MARKS.colon}
			</span>}
			<span className="json-val" onClick={editLine}>{isNull ? "null" : (quote + val + quote)}</span>
			<input type="text" name="value" defaultValue={val} autoFocus={true} />
			{comma && <span className="json-comma">{MARKS.comma}</span>}
			<button type="submit">update</button>
			<button onClick={resetLine}>cancel</button>
		</form>
		</div>
	)
}

function JsonObject(props) {
	const {name, val:obj, comma, update: pUpdate} = props;
	const keys = Object.keys(obj);
	const update = (k, v, o) => {
		const newValue = {...obj, [k]: v};
		if (k !== o) delete newValue[o];
		pUpdate(name, newValue);
	}
	const kids = keys.map((k, i) => {
		const v = obj[k];
		const type = getType(v);
		const comma = (i < keys.length - 1);
		if (type === TYPE_ARRAY)
			return <JsonArray key={i} name={k} val={v} comma={comma} />;
		else if (type === TYPE_OBJECT)
			return <JsonObject key={i} name={k} val={v} comma={comma} />;
		else
			return <JsonLine key={i} name={k} val={v} comma={comma}
				isNull={v === null} update={update} ptype={TYPE_OBJECT} />;
	});
	return (
		<div className="json-object">
			<JsonLine name={name} val={MARKS.object.beg} />
			<div className="json-kids">{kids}</div>
			<JsonLine val={MARKS.object.end} comma={comma} />
		</div>
	)
}

function JsonArray(props) {
	const {name, val:arr, comma} = props;
	const kids = arr.map((v, i) => {
		const type = getType(v);
		const comma = (i < arr.length - 1);
		if (type === TYPE_ARRAY)
			return <JsonArray key={i} index={i} val={v} comma={comma} />;
		else if (type === TYPE_OBJECT)
			return <JsonObject key={i} index={i} val={v} comma={comma} />;
		else
			return <JsonLine key={i} index={i} val={v} comma={comma}
				isNull={v === null} parent={arr} ptype={TYPE_ARRAY} />;
	});
	return (
		<div className="json-array">
			<JsonLine name={name} val={MARKS.array.beg} />
			<div className="json-kids">{kids}</div>
			<JsonLine val={MARKS.array.end} comma={comma} />
		</div>
	)
}

export class JsonEdit extends React.PureComponent {
	constructor(props) {
		super(props);

		// clone the json value
		const valueClone = JSON.parse(JSON.stringify(props.value));

		this.state = {
			value: valueClone,
			action: '',
			jpath: ''
		};

	}

	update(k, v, o) {
		const newValue = {...this.state.value, [k]: v};
		if (k !== o) delete newValue[o];
		this.setState({value: newValue});
	}

	render() {
		return (
		<div className={"json-edit"}>
			<div>
				<JsonObject val={this.state.value} update={this.update} />
			</div>
			<div>
				<button type="button" onClick={e => this.props.onChange(this.state.value)}>Save</button>
			</div>
		</div>
		)
	}
}

JsonEdit.propTypes = {
	value: PropTypes.object.isRequired,
	className: PropTypes.string,
	onChange: PropTypes.func // (value: String, id: props.id)
};

JsonEdit.defaultProps = {
	className: '',
	onChange: function(){}
};
