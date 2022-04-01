import React, { useState } from 'react';
import useSWR from 'swr';
import api from 'lib/utils/api';
import { useTranslations } from 'i18n';
import { ItemCard, Loader } from 'components';
import './Items.scss';

const SelectFilter = ({ onChange, options }) => (
  <div className="items-filter items-filter--select">
    <select onChange={event => onChange(event.target.value)}>
      {options.map(option => (
        <option key={`option-${option.label}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

function useItems(filters) {
  const { data, error } = useSWR(['/items', filters], (url, params) => api.get(url, params));

  return {
    error,
    items: data,
    loading: !data
  };
}

function Items() {
  const { t } = useTranslations();
  const [filters, setFilters] = useState({
    search: null,
    category: null,
    level: null,
    type: null,
    features: null
  });
  const { items, loading } = useItems(filters);

  const onFilterChange = (key, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [key]: value.length > 0 ? value : null }));
  };

  return (
    <div className="items-page">
      <div className="items-header">
        <div className="items-filters">
          <SelectFilter
            key="category-filter"
            onChange={value => onFilterChange('category', value)}
            options={[
              { label: t('filter.categories.all'), value: '' },
              { label: t('labelSwords'), value: 'swords' },
              { label: t('labelAxes'), value: 'axes' },
              { label: t('labelHammers'), value: 'hammers' },
              { label: t('labelSpears'), value: 'spears' },
              { label: t('labelDaggers'), value: 'daggers' },
              { label: t('labelMagical'), value: 'magical' },
              { label: t('labelHelmets'), value: 'helmets' },
              { label: t('labelArmors'), value: 'armors' },
              { label: t('labelGloves'), value: 'gloves' },
              { label: t('labelShields'), value: 'shields' },
              { label: t('labelBoots'), value: 'boots' },
              { label: t('labelBelts'), value: 'belts' },
              { label: t('labelCloaks'), value: 'cloaks' },
              { label: t('labelAmulets'), value: 'amulets' },
              { label: t('labelRings'), value: 'rings' },
              { label: t('labelBags'), value: 'bags' }
            ]}
          />
          <SelectFilter
            key="level-filter"
            onChange={value => onFilterChange('level', value)}
            options={[
              { label: t('filter.levels.all'), value: '' },
              { label: `1 ${t('filter.level')}`, value: 1 },
              { label: `2 ${t('filter.level')}`, value: 2 },
              { label: `3 ${t('filter.level')}`, value: 3 },
              { label: `4 ${t('filter.level')}`, value: 4 },
              { label: `5 ${t('filter.level')}`, value: 5 },
              { label: `6 ${t('filter.level')}`, value: 6 },
              { label: `7 ${t('filter.level')}`, value: 7 },
              { label: `8 ${t('filter.level')}`, value: 8 },
              { label: `9 ${t('filter.level')}`, value: 9 },
              { label: `10 ${t('filter.level')}`, value: 10 },
              { label: `11 ${t('filter.level')}`, value: 11 },
              { label: `12 ${t('filter.level')}`, value: 12 },
              { label: `13 ${t('filter.level')}`, value: 13 },
              { label: `14 ${t('filter.level')}`, value: 14 },
              { label: `15 ${t('filter.level')}`, value: 15 }
            ]}
          />
          <SelectFilter
            key="type-filter"
            onChange={value => onFilterChange('type', value)}
            options={[
              { label: t('filter.types.all'), value: '' },
              { label: t('labelOneHanded'), value: 'one-handed' },
              { label: t('labelTwoHanded'), value: 'two-handed' }
            ]}
          />
          <SelectFilter
            key="features-filter"
            onChange={value => onFilterChange('features', value)}
            options={[
              { label: t('filter.features.all'), value: '' },
              { label: t('labelItemArtefact'), value: 'artefact' },
              { label: t('labelItemFromSet'), value: 'from-set' }
            ]}
          />
        </div>
      </div>

      <div className="items-body">
        <div className="items-list flex-row">
          {loading && <Loader />}
          {items &&
            items.data.map(item => (
              <div className="items-list__item flex-col" key={item.id}>
                <ItemCard item={item} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Items;
