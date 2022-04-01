import React, { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import api from 'lib/utils/api';
import { Loader, PageList, ChronicleItem } from 'components';
import './Chronicles.scss';
import { decodePayload, initSocket } from '../../lib/utils/socket';

function useChronicles() {
  const sort = { 'stats.experience': 'desc', 'stats.rating': 'desc' };
  const [page, setPage] = useState(1);
  const { data, mutate, error } = useSWR(['/chronicles', page], (url, page) => api.get(url, { page, sort }));

  const addChronicle = chronicle => {
    mutate({ ...data.data, docs: [chronicle, ...data.data.docs] });
  };

  return {
    error,
    chronicles: data,
    loading: !data,
    setPage,
    addChronicle
  };
}

function Chronicles() {
  const { chronicles, loading, setPage, addChronicle } = useChronicles();

  const onChroniclesUpdate = useCallback(
    payload => {
      addChronicle(decodePayload(payload));
    },
    [addChronicle]
  );

  useEffect(() => {
    const socket = initSocket();
    socket.on('chroniclesUpdate', onChroniclesUpdate);

    return () => {
      socket.disconnect();
    };
  }, [onChroniclesUpdate]);

  if (loading) {
    return (
      <div className="heroes-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="chronicles-page">
      {chronicles.data && (
        <PageList
          data={chronicles.data}
          direction="column"
          onPage={setPage}
          renderItem={chronicle => <ChronicleItem chronicle={chronicle} />}
        />
      )}
    </div>
  );
}

export default Chronicles;
