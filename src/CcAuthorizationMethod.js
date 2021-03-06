import { html } from 'lit-element';
import { AuthorizationMethod } from '@advanced-rest-client/authorization-method/src/AuthorizationMethod.js';
import { CcConsumerMixin } from '@advanced-rest-client/client-certificates-consumer-mixin/index.js';
import { notifyChange } from '@advanced-rest-client/authorization-method/src/Utils.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@advanced-rest-client/date-time/date-time.js';
import styles from './Styles.js';

export const METHOD_CC = 'client certificate';
export const defaultItemTemplate = Symbol();
export const certItemTemplate = Symbol();
export const emptyTemplate = Symbol();
export const contentTemplate = Symbol();
export const dateTimeTemplate = Symbol();
export const importTemplate = Symbol();
export const selectedHandler = Symbol();
export const importHandler = Symbol();

export class CcAuthorizationMethod extends CcConsumerMixin(AuthorizationMethod) {

  get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * The id of selected certificate.
       */
      selected: { type: String },
      /**
       * When set it renders `none` option in the list of certificates.
       */
      none: { type: Boolean },
      /**
       * When set it renders `import certificate` button.
       * When enabled the application must handle
       * `client-certificate-import` event dispatched by this element
       * to render some kind of UI to import a certificate.
       * The element does not have an UI to import certificates.
       *
       * The event bubbles and is cancelable.
       */
      importButton: { type: Boolean }
    };
  }

  get type() {
    return METHOD_CC;
  }

  set type(value) {}
  /**
   * @return {Boolean} True if the `items` array has values.
   */
  get hasItems() {
    const { items } = this;
    return !!(items && items.length);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.setAttribute('type', METHOD_CC);
  }

  /**
   * Validates the form.
   *
   * @return {Boolean} Validation result. Always true.
   */
  validate() {
    return true;
  }
  /**
   * Creates a settings object with user provided data for current method.
   *
   * @return {Object} User provided data
   */
  serialize() {
    const { selected } = this;
    if (!selected || selected === 'none') {
      return {};
    }
    return {
      id: this.selected
    };
  }
  /**
   * Restores previously serialized settings.
   * A method type must be selected before calling this function.
   *
   * @param {Object} settings Previousy serialized values.
   * @param {String} settings.id An ID of selected certificate
   */
  restore(settings={}) {
    this.selected = settings.id;
  }

  [selectedHandler](e) {
    const { value } = e.detail;
    this.selected = value;
    notifyChange(this);
  }

  [importHandler]() {
    this.dispatchEvent(new CustomEvent('client-certificate-import', {
      bubbles: true,
      composed: true,
      cancelable: true,
    }));
  }

  render() {
    const { hasItems } = this;
    return html`<style>${this.styles}</style>
    ${this[importTemplate]()}
    ${hasItems ? this[contentTemplate]() : this[emptyTemplate]()}`;
  }

  [contentTemplate]() {
    const {
      compatibility,
      items,
      selected,
    } = this;
    return html`
    <div class="list">
      <anypoint-radio-group
        ?compatibility="${compatibility}"
        attrForSelected="data-id"
        .selected="${selected}"
        @selected-changed="${this[selectedHandler]}"
      >
        ${this[defaultItemTemplate]()}
        ${items.map((item) => this[certItemTemplate](item))}
      </anypoint-radio-group>
    </div>`;
  }

  [emptyTemplate]() {
    return html`<p class="empty-screen">There are no certificates installed in this application.</p>`;
  }

  [defaultItemTemplate]() {
    const { compatibility, none } = this;
    if (!none) {
      return '';
    }
    return html`<anypoint-radio-button
      data-id="none"
      ?compatibility="${compatibility}"
      class="default"
    >None</anypoint-radio-button>`;
  }

  [certItemTemplate](item) {
    const { compatibility } = this;
    return html`<anypoint-radio-button
      data-id="${item._id}"
      ?compatibility="${compatibility}"
    >
      <div class="cert-meta">
        <span class="name">${item.name}</span>
        <span class="created">Added: ${this[dateTimeTemplate](item.created)}</span>
      </div>
    </anypoint-radio-button>`;
  }

  [dateTimeTemplate](created) {
    return html`<date-time
      .date="${created}"
      year="numeric"
      month="numeric"
      day="numeric"
      hour="numeric"
      minute="numeric"
    ></date-time>`;
  }

  [importTemplate]() {
    const { importButton } = this;
    if (!importButton) {
      return '';
    }
    return html`
    <anypoint-button
      title="Opens a dialog that allows to import client certificate"
      aria-label="Activate to open import certificate dialog"
      @click="${this[importHandler]}"
    >Import certificate</anypoint-button>`;
  }

  /**
   * Dispatched when the user requested to import a certificate.
   *
   * The event bubbles and is cancelable.
   *
   * @event client-certificate-import
   */
}
