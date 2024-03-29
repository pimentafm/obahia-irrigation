import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import moment from 'moment';

import HtmlParser from 'react-html-parser';

import { oba } from '../../services';

import { Modal, Popover, Button, DatePicker } from 'antd';

import OlMap from 'ol/Map';

import { Select } from 'antd';
import 'antd/dist/antd.css';
import { FiMenu } from 'react-icons/fi';
import { FaInfoCircle } from 'react-icons/fa';
import { GoAlert } from 'react-icons/go';

import ChangeLanguage from './ChangeLanguage';

import ToolsMenu from './ToolsMenu';
import ZoomControl from './ZoomControl';
import Scalebar from './ScaleBar';

import StaticLayerSwitcher from '../StaticLayerSwitcher';
import LayerSwitcher from '../LayerSwitcher';

import { Container, Header, Footer, Content } from './styles';

import { useTranslation } from 'react-i18next';

// import fluxogramImage from '../../assets/images/fluxogram.png';

interface CodeNameData {
  code: number;
  name: string;
}

interface MenuProps {
  ishidden: number;
  defaultCategory: string;
  defaultCodeName?: CodeNameData;
  defaultWatershed?: string;
  defaultYear: number;
  defaultMonth: number;
  handleWatershed?(year: string): void;
  handleCodeName?(codename: string): void;
  handleYear(year: number): void;
  handleMonth(month: number): void;
  map: OlMap;
}

const { Option } = Select;

const Menu: React.FC<MenuProps> = ({
  ishidden,
  defaultCategory,
  defaultCodeName,
  defaultWatershed,
  defaultYear,
  defaultMonth,
  handleCodeName,
  handleWatershed,
  handleYear,
  handleMonth,
  map,
  ...rest
}) => {
  const { t } = useTranslation();
  document.title = t('appname');

  const [hidden, setHidden] = useState(ishidden);
  const [termsOfUseModal, setTermsOfUseModal] = useState<boolean>(false);
  const [metadataModal, setMetadataModal] = useState<boolean>(false);

  const [amountVisible, setAmountVisible] = useState(true);
  const [evapotranspirationVisible, setEvapotranspirationVisible] = useState(
    false,
  );
  const [irrigationVisible, setIrrigationVisible] = useState(false);

  const history = useHistory();
  const [category, setCategory] = useState(defaultCategory);

  const [codenames, setCodenames] = useState([]);
  const [watersheds_list] = useState(['Grande', 'Corrente', 'Carinhanha']);

  const [downloadURL, setDownloadURL] = useState('');

  const termsOfUse = HtmlParser(
    `<span style="color: #1f5582; font-weight: 600; font-size: 16px;">OBahia</span><span> ${t(
      'modal_terms_title',
    )}</span>`,
  );

  const additionalInformation = HtmlParser(
    `<span style="color: #1f5582; font-weight: 600; font-size: 16px;">OBahia</span><span> ${t(
      'modal_info_title',
    )}</span>`,
  );

  const [categories, setCategories] = useState([
    [t('select_region'), 'regional'],
    [t('select_watershed'), 'gcc'],
    [t('select_drainage'), 'drainage'],
    [t('select_municipal'), 'counties'],
  ]);

  const { MonthPicker } = DatePicker;

  const showTermsOfUseModal = () => {
    setTermsOfUseModal(true);
  };

  const showMetadataModal = () => {
    setMetadataModal(true);
  };

  const handleOk = () => {
    setTermsOfUseModal(false);
    setMetadataModal(false);
  };

  const handleCancel = () => {
    setTermsOfUseModal(false);
    setMetadataModal(false);
  };

  const handleMenu = useCallback(() => {
    if (hidden === 0) {
      setHidden(1);
    } else {
      setHidden(0);
    }
  }, [hidden]);

  const handleCategory = useCallback(
    e => {
      setCategory(e);
      history.push(e);
    },
    [history],
  );

  const handleLayerVisibility = useCallback(
    (e, id) => {
      const lyr_name = id; // obj.target.name;

      if (lyr_name === 'amount') {
        setAmountVisible(e);
        setEvapotranspirationVisible(!e);
        setIrrigationVisible(!e);
      }

      if (lyr_name === 'evapotranspiration') {
        setAmountVisible(!e);
        setEvapotranspirationVisible(e);
        setIrrigationVisible(!e);
      }

      if (lyr_name === 'irrigation') {
        setAmountVisible(!e);
        setEvapotranspirationVisible(!e);
        setIrrigationVisible(e);
      }

      map.getLayers().forEach(lyr => {
        if (lyr.getClassName() !== 'ol-layer') {
          if (lyr.get('name') === lyr_name) {
            lyr.setVisible(e);
          } else {
            lyr.setVisible(!e);
          }
        }
      });
    },
    [map],
  );

  const handleStaticLayerVisibility = useCallback(
    (e, id) => {
      const lyr_name = id;

      map.getLayers().forEach(lyr => {
        if (lyr.get('name') === lyr_name) {
          lyr.setVisible(e);
        }
      });
    },
    [map],
  );

  const handleLayerOpacity = useCallback(
    (opacity, lyr_name) => {
      map.getLayers().forEach(lyr => {
        if (lyr.get('name') === lyr_name) {
          lyr.setOpacity(opacity);
        }
      });
    },
    [map],
  );

  const handleDate = useCallback(
    (_, dateString) => {
      const year = parseInt(dateString.split('-')[0]);
      const month = parseInt(dateString.split('-')[1]);

      handleYear(year);
      handleMonth(month);
    },
    [handleYear, handleMonth],
  );

  let watershedsLabel = null;
  let watershedSelect = null;

  if (category === 'gcc') {
    watershedsLabel = <label>{t('label_name')}</label>;
    watershedSelect = (
      <Select
        id="select"
        defaultValue={defaultWatershed}
        onChange={handleWatershed}
        style={{ color: '#000' }}
      >
        {watersheds_list.map(c => (
          <Option key={c} value={c} style={{ color: '#000' }}>
            {c}
          </Option>
        ))}
      </Select>
    );
  } else {
    watershedSelect = null;
  }

  let codeNameLabel = null;
  let codeNameSelect = null;

  if (category === 'drainage' || category === 'counties') {
    codeNameLabel = <label>{t('label_name')}</label>;
    codeNameSelect = (
      <Select
        id="select"
        defaultValue={defaultCodeName?.name}
        onChange={handleCodeName}
      >
        {codenames.map(c => (
          <Option key={c} value={c} style={{ color: '#000' }}>
            {c}
          </Option>
        ))}
      </Select>
    );
  } else {
    codeNameSelect = null;
  }

  useEffect(() => {
    oba
      .post('geom/', {
        table_name: category === 'counties' ? 'counties' : 'drainage',
        headers: {
          'Content-type': 'application/json',
        },
      })
      .then(response => {
        const data = response.data;

        const names = data.map((n: CodeNameData) => n.name);
        const codes = data.map((c: CodeNameData) => c.code);

        const codenames = names.map(
          (n: string, c: number) => n + ' - ' + codes[c],
        );
        setCodenames(codenames);
      })
      .catch(e => {
        throw new Error('Do not load codenames');
      });

    switch (category) {
      case 'regional':
        setDownloadURL(
          `ftp://obahia.dea.ufv.br/evapotranspiration/region/evapotranspiration_${defaultYear}_${defaultMonth}.tif`,
        );
        break;
      case 'gcc':
        setDownloadURL(
          `ftp://obahia.dea.ufv.br/evapotranspiration/gcc/${defaultWatershed?.toLowerCase()}/evapotranspiration_${defaultYear}_${defaultMonth}.tif`,
        );
        break;
      case 'drainage':
        setDownloadURL(
          `ftp://obahia.dea.ufv.br/evapotranspiration/drainage/${defaultCodeName?.code}/evapotranspiration_${defaultCodeName?.code}_${defaultYear}_${defaultMonth}.tif`,
        );
        break;
      case 'counties':
        setDownloadURL(
          `ftp://obahia.dea.ufv.br/evapotranspiration/counties/evapotranspiration_${defaultCodeName?.code}_${defaultYear}_${defaultMonth}.tif`,
        );
        break;
    }

    setCategories([
      [t('select_region'), '/'],
      [t('select_watershed'), 'gcc'],
      [t('select_drainage'), 'drainage'],
      [t('select_municipal'), 'counties'],
    ]);
  }, [
    category,
    defaultYear,
    defaultMonth,
    defaultCategory,
    defaultWatershed,
    defaultCodeName,
    t,
  ]);

  return (
    <Container id="menu" ishidden={hidden}>
      <ChangeLanguage ishidden={hidden} />
      <ToolsMenu ishidden={hidden} />
      <ZoomControl ishidden={hidden} map={map} />
      <Scalebar id="scalebar" map={map} />

      <Header ishidden={hidden}>
        <a href="http://obahia.dea.ufv.br">
          <img
            src="http://obahia.dea.ufv.br/static/geonode/img/logo.png"
            alt="Obahia"
          />
        </a>

        <Popover placement="right" content={t('tooltip_menu')}>
          <FiMenu
            id="handleMenu"
            type="menu"
            className="nav_icon"
            style={{ fontSize: '20px', color: '#000' }}
            onClick={handleMenu}
          />
        </Popover>
      </Header>

      <Content>
        <div className="card-menu">
          <span>{t('appname')}</span>
        </div>

        <div className="static-layers">
          <span className="span-text">
            <label>{t('description_title')}</label> {t('description_content')}{' '}
            <FaInfoCircle
              className="text-icon"
              style={{ fontSize: '12px', color: '#1f5582', cursor: 'pointer' }}
              onClick={showMetadataModal}
            />
            . {t('description_terms')}{' '}
            <GoAlert
              className="text-icon"
              style={{ fontSize: '12px', color: '#1f5582', cursor: 'pointer' }}
              onClick={showTermsOfUseModal}
            />
            .
          </span>
        </div>

        <label>{t('label_level')}</label>
        <Select
          id="select-category"
          defaultValue={category}
          onChange={handleCategory}
        >
          {categories.map(c => (
            <Option key={c[1]} value={c[1]}>
              {c[0]}
            </Option>
          ))}
        </Select>

        {watershedsLabel}
        {watershedSelect}

        {codeNameLabel}
        {codeNameSelect}

        <label>{t('label_date')}</label>
        <MonthPicker
          allowClear={false}
          disabledDate={d => d.isBefore('2001-01') || d.isAfter('2020-12')}
          defaultPickerValue={moment('2020-12', 'YYYY-MM')}
          defaultValue={moment('2020-12', 'YYYY-MM')}
          format={'YYYY-MM'}
          onChange={handleDate}
          placeholder="2020-12"
        />
        <LayerSwitcher
          name="amount"
          label={t('label_amount')}
          handleLayerOpacity={handleLayerOpacity}
          handleLayerVisibility={handleLayerVisibility}
          layerIsVisible={amountVisible}
          legendIsVisible={true}
          layerInfoIsVisible={false}
          switchColor="#3e8ec4"
          // downloadURL={downloadURL.replace(
          //   /evapotranspiration/gi,
          //   'amount',
          // )}
        />

        <LayerSwitcher
          name="evapotranspiration"
          label={t('label_evapo')}
          handleLayerOpacity={handleLayerOpacity}
          handleLayerVisibility={handleLayerVisibility}
          layerIsVisible={evapotranspirationVisible}
          legendIsVisible={true}
          layerInfoIsVisible={true}
          switchColor="#ffa500"
          downloadURL={downloadURL}
        />

        <LayerSwitcher
          name="irrigation"
          label={t('label_irrigation')}
          handleLayerOpacity={handleLayerOpacity}
          handleLayerVisibility={handleLayerVisibility}
          layerIsVisible={irrigationVisible}
          legendIsVisible={true}
          layerInfoIsVisible={true}
          switchColor="#006400"
          downloadURL={downloadURL.replace(
            /evapotranspiration/gi,
            'irrigation',
          )}
        />

        <div className="static-layers">
          <StaticLayerSwitcher
            name="hidrography"
            label={t('label_hidrography')}
            handleLayerVisibility={handleStaticLayerVisibility}
            layerIsVisible={false}
            legendIsVisible={false}
            layerInfoIsVisible={false}
            switchColor="#0000ff"
          />
          <StaticLayerSwitcher
            name="highways"
            label={t('label_highways')}
            handleLayerVisibility={handleStaticLayerVisibility}
            layerIsVisible={false}
            legendIsVisible={false}
            layerInfoIsVisible={false}
            switchColor="#800000"
          />

          {category === 'regional' && (
            <>
              <StaticLayerSwitcher
                name="watersheds"
                label={t('label_watersheds')}
                handleLayerVisibility={handleStaticLayerVisibility}
                layerIsVisible={true}
                legendIsVisible={false}
                layerInfoIsVisible={false}
                switchColor="#000000"
              />
              <StaticLayerSwitcher
                name="counties"
                label={t('label_counties')}
                handleLayerVisibility={handleStaticLayerVisibility}
                layerIsVisible={false}
                legendIsVisible={false}
                layerInfoIsVisible={false}
                switchColor="#696969"
              />
            </>
          )}
        </div>
        <div className="final-space"></div>
      </Content>

      <Footer ishidden={hidden}>
        <Popover placement="right" content={t('tooltip_terms')}>
          <GoAlert
            className="footer_icon"
            style={{ fontSize: '20px', color: '#fff', cursor: 'pointer' }}
            onClick={showTermsOfUseModal}
          />
        </Popover>
        <Popover placement="right" content={t('tooltip_info')}>
          <FaInfoCircle
            className="footer_icon"
            style={{ fontSize: '20px', color: '#fff', cursor: 'pointer' }}
            onClick={showMetadataModal}
          />
        </Popover>
      </Footer>

      <Modal
        title={termsOfUse}
        style={{ top: 20 }}
        visible={termsOfUseModal}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            style={{
              background: '#1f5582',
              color: '#fff',
              borderColor: '#fff',
            }}
            onClick={handleOk}
          >
            Continue
          </Button>,
        ]}
      >
        <p style={{ textAlign: 'justify' }}>{t('terms_of_use')}</p>
      </Modal>

      <Modal
        title={additionalInformation}
        width={800}
        style={{ top: 20 }}
        visible={metadataModal}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            style={{
              background: '#1f5582',
              color: '#fff',
              borderColor: '#fff',
            }}
            onClick={handleOk}
          >
            Continue
          </Button>,
        ]}
      >
        <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph01')}</p>
        <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph02')}</p>
        <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph03')}</p>
        <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph04')}</p>
        <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph05')}</p>
        <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph06')}</p>

        <p style={{ textAlign: 'justify' }}>
          {t('modal_info_ref01')}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.mdpi.com/2072-4292/12/22/3725"
          >
            {' '}
            https://doi.org/10.3390/rs12223725
          </a>
        </p>

        {/* <img
          width="100%"
          style={{ marginBottom: '10px' }}
          src={fluxogramImage}
          alt="Metodology"
        />
        <p style={{ textAlign: 'justify' }}>
          <b>{t('modal_info_figure')} </b>
          {t('modal_info_figure_legend')}
        </p>

        <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph06')}</p>
        <p style={{ textAlign: 'justify' }}>{t('modal_info_paraghaph07')}</p> */}
      </Modal>
    </Container>
  );
};

export default Menu;
