import pandas as pd
import numpy as np
import argparse
import os
from datetime import datetime, timedelta
import random

class TemperatureSimulator:
    """
    Simulates realistic temperature data for frozen food shipments
    """
    
    def __init__(self, baseline_temp=-18.0, normal_variance=0.5, 
                 anomaly_chance=0.05, anomaly_magnitude=8.0):
        """
        Initialize the temperature simulator
        
        Args:
            baseline_temp (float): Target temperature in Celsius
            normal_variance (float): Standard deviation for normal fluctuations
            anomaly_chance (float): Probability of temperature anomaly per reading
            anomaly_magnitude (float): Temperature increase during anomalies
        """
        self.baseline_temp = baseline_temp
        self.normal_variance = normal_variance
        self.anomaly_chance = anomaly_chance
        self.anomaly_magnitude = anomaly_magnitude
    
    def generate_temp_log(self, lot_code, duration_hours=24, frequency_minutes=5):
        """
        Generate temperature log for a specific shipment
        
        Args:
            lot_code (str): Unique lot code for the shipment
            duration_hours (int): Duration of monitoring in hours
            frequency_minutes (int): Frequency of readings in minutes
            
        Returns:
            pandas.DataFrame: DataFrame with timestamp and temperature_celsius columns
        """
        # Calculate number of data points
        total_minutes = duration_hours * 60
        num_points = total_minutes // frequency_minutes
        
        # Create time index
        start_time = datetime.now()
        time_index = pd.date_range(
            start=start_time,
            periods=num_points,
            freq=f'{frequency_minutes}min'
        )
        
        # Generate base temperature readings (normal fluctuations)
        temperatures = np.random.normal(
            loc=self.baseline_temp,
            scale=self.normal_variance,
            size=num_points
        )
        
        # Inject anomalies
        anomaly_points = np.random.random(num_points) < self.anomaly_chance
        anomaly_magnitudes = np.random.exponential(
            scale=self.anomaly_magnitude,
            size=np.sum(anomaly_points)
        )
        
        temperatures[anomaly_points] += anomaly_magnitudes
        
        # Add some realistic patterns (gradual warming/cooling cycles)
        cycle_frequency = 2 * np.pi / (60 // frequency_minutes)  # 1 hour cycles
        cycle_amplitude = 0.3
        cycles = cycle_amplitude * np.sin(cycle_frequency * np.arange(num_points))
        temperatures += cycles
        
        # Create DataFrame
        df = pd.DataFrame({
            'timestamp': time_index,
            'temperature_celsius': np.round(temperatures, 2)
        })
        
        return df
    
    def save_temp_log(self, df, lot_code, output_dir='temp_logs'):
        """
        Save temperature log to CSV file
        
        Args:
            df (pandas.DataFrame): Temperature data
            lot_code (str): Lot code for filename
            output_dir (str): Output directory
            
        Returns:
            str: Path to saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate filename
        filename = f"{lot_code}_temp_log.csv"
        filepath = os.path.join(output_dir, filename)
        
        # Save to CSV
        df.to_csv(filepath, index=False)
        
        return filepath
    
    def generate_and_save(self, lot_code, duration_hours=24, frequency_minutes=5, output_dir='temp_logs'):
        """
        Generate and save temperature log in one step
        
        Args:
            lot_code (str): Unique lot code
            duration_hours (int): Duration in hours
            frequency_minutes (int): Reading frequency in minutes
            output_dir (str): Output directory
            
        Returns:
            tuple: (DataFrame, filepath)
        """
        df = self.generate_temp_log(lot_code, duration_hours, frequency_minutes)
        filepath = self.save_temp_log(df, lot_code, output_dir)
        
        return df, filepath
    
    def generate_batch_logs(self, lot_codes, duration_hours=24, frequency_minutes=5, output_dir='temp_logs'):
        """
        Generate temperature logs for multiple lot codes
        
        Args:
            lot_codes (list): List of lot codes
            duration_hours (int): Duration in hours
            frequency_minutes (int): Reading frequency in minutes
            output_dir (str): Output directory
            
        Returns:
            dict: Dictionary mapping lot codes to file paths
        """
        results = {}
        
        for lot_code in lot_codes:
            try:
                df, filepath = self.generate_and_save(
                    lot_code, duration_hours, frequency_minutes, output_dir
                )
                results[lot_code] = {
                    'filepath': filepath,
                    'data_points': len(df),
                    'avg_temp': df['temperature_celsius'].mean(),
                    'min_temp': df['temperature_celsius'].min(),
                    'max_temp': df['temperature_celsius'].max(),
                    'anomalies': len(df[df['temperature_celsius'] > self.baseline_temp + 2])
                }
                print(f"Generated log for {lot_code}: {filepath}")
                
            except Exception as e:
                print(f"Error generating log for {lot_code}: {e}")
                results[lot_code] = {'error': str(e)}
        
        return results

def main():
    """
    Command line interface for the temperature simulator
    """
    parser = argparse.ArgumentParser(description='Generate temperature simulation logs for frozen food shipments')
    
    parser.add_argument('lot_code', help='Lot code for the shipment')
    parser.add_argument('--duration', type=int, default=24, help='Duration in hours (default: 24)')
    parser.add_argument('--frequency', type=int, default=5, help='Reading frequency in minutes (default: 5)')
    parser.add_argument('--output-dir', default='temp_logs', help='Output directory (default: temp_logs)')
    parser.add_argument('--baseline-temp', type=float, default=-18.0, help='Baseline temperature in Celsius (default: -18.0)')
    parser.add_argument('--variance', type=float, default=0.5, help='Normal temperature variance (default: 0.5)')
    parser.add_argument('--anomaly-chance', type=float, default=0.05, help='Probability of anomalies (default: 0.05)')
    parser.add_argument('--anomaly-magnitude', type=float, default=8.0, help='Anomaly temperature increase (default: 8.0)')
    
    args = parser.parse_args()
    
    # Create simulator
    simulator = TemperatureSimulator(
        baseline_temp=args.baseline_temp,
        normal_variance=args.variance,
        anomaly_chance=args.anomaly_chance,
        anomaly_magnitude=args.anomaly_magnitude
    )
    
    # Generate log
    try:
        df, filepath = simulator.generate_and_save(
            args.lot_code,
            args.duration,
            args.frequency,
            args.output_dir
        )
        
        print(f"\nTemperature log generated successfully!")
        print(f"Lot Code: {args.lot_code}")
        print(f"File: {filepath}")
        print(f"Data Points: {len(df)}")
        print(f"Duration: {args.duration} hours")
        print(f"Frequency: Every {args.frequency} minutes")
        print(f"\nTemperature Statistics:")
        print(f"  Average: {df['temperature_celsius'].mean():.2f}°C")
        print(f"  Minimum: {df['temperature_celsius'].min():.2f}°C")
        print(f"  Maximum: {df['temperature_celsius'].max():.2f}°C")
        print(f"  Std Dev: {df['temperature_celsius'].std():.2f}°C")
        
        # Count potential quality issues
        high_temp_count = len(df[df['temperature_celsius'] > -15.0])
        if high_temp_count > 0:
            print(f"  Quality Alerts: {high_temp_count} readings above -15°C")
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())