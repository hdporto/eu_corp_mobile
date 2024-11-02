import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, {useState, useEffect} from 'react'
import AdminRisks from '../../components/admin/AdminRisks';
import DepartmentRisks from '../../components/departments/DepartmentRisks';
import { supabase } from '../../../utils/supabaseClient';


const index = () => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchUserRole = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
  
          if (session?.user) {
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
  
            if (error) throw error;
  
            setRole(data.role);
          }
        } catch (error) {
          console.error('Error fetching role:', error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserRole();
    }, []);
  
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
  
    return role === 'admin' ? <AdminRisks /> : <DepartmentRisks />;
}

export default index

const styles = StyleSheet.create({})