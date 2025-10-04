#!/usr/bin/env python3
"""
Demo script to generate multiple temperature logs for testing
"""

from simulate_temperature import TemperatureSimulator
import random

def generate_demo_logs():
    """Generate demo temperature logs for different supply chain scenarios"""
    
    simulator = TemperatureSimulator()
    
    # Demo scenarios with different characteristics
    scenarios = [
        {
            'lot_codes': ['FL001234', 'FL001235', 'FL001236'],
            'description': 'Normal flour shipments',
            'duration': 48,
            'baseline_temp': 20.0,  # Room temperature for flour
            'variance': 2.0,
            'anomaly_chance': 0.02
        },
        {
            'lot_codes': ['CH007890', 'CH007891'],
            'description': 'Cheese shipments (refrigerated)',
            'duration': 24,
            'baseline_temp': 4.0,  # Refrigerated
            'variance': 1.0,
            'anomaly_chance': 0.03
        },
        {
            'lot_codes': ['PZ123456', 'PZ123457', 'PZ123458'],
            'description': 'Frozen pizza shipments',
            'duration': 36,
            'baseline_temp': -18.0,  # Frozen
            'variance': 0.5,
            'anomaly_chance': 0.05
        }
    ]
    
    print("Generating demo temperature logs...")
    print("=" * 50)
    
    for scenario in scenarios:
        print(f"\nScenario: {scenario['description']}")
        print(f"Lot codes: {', '.join(scenario['lot_codes'])}")
        
        # Create simulator with scenario-specific parameters
        sim = TemperatureSimulator(
            baseline_temp=scenario['baseline_temp'],
            normal_variance=scenario['variance'],
            anomaly_chance=scenario['anomaly_chance']
        )
        
        # Generate logs for all lot codes in this scenario
        results = sim.generate_batch_logs(
            lot_codes=scenario['lot_codes'],
            duration_hours=scenario['duration'],
            frequency_minutes=10,  # Every 10 minutes
            output_dir='demo_temp_logs'
        )
        
        # Print summary
        for lot_code, result in results.items():
            if 'error' not in result:
                print(f"  {lot_code}: {result['data_points']} points, "
                      f"avg {result['avg_temp']:.1f}°C, "
                      f"{result['anomalies']} anomalies")
    
    print("\n" + "=" * 50)
    print("Demo logs generated in 'demo_temp_logs' directory")
    print("Use these files to test the temperature monitoring features")

if __name__ == "__main__":
    generate_demo_logs()