// src/hooks/useEmployeeTags.js - Specialized hook for tag management
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { tagAPI } from '../store/api/employeeAPI';

export const useEmployeeTags = () => {
  const dispatch = useDispatch();
  
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const actions = {
    fetchTags: useCallback(async (tagType = null) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tagAPI.getAll(tagType);
        setTags(response.data);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }, []),

    createTag: useCallback(async (data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tagAPI.create(data);
        setTags(prev => [response.data, ...prev]);
        return response.data;
      } catch (err) {
        setError(err.response?.data || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    updateTag: useCallback(async (id, data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tagAPI.update(id, data);
        setTags(prev => prev.map(tag => tag.id === id ? response.data : tag));
        return response.data;
      } catch (err) {
        setError(err.response?.data || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    deleteTag: useCallback(async (id) => {
      setLoading(true);
      setError(null);
      try {
        await tagAPI.delete(id);
        setTags(prev => prev.filter(tag => tag.id !== id));
      } catch (err) {
        setError(err.response?.data || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),
  };

  return {
    tags,
    loading,
    error,
    ...actions,
  };
};