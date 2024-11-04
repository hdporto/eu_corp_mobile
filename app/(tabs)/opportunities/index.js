import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, {useState, useEffect} from 'react'
import AdminOpportunities from '../../components/admin/AdminOpportunities'
import DepartmentOpportunities from '../../components/departments/DepartmentOpportunities'
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
  
    return role === 'admin' ? <AdminOpportunities /> : <DepartmentOpportunities />;
}

export default index

const styles = StyleSheet.create({})