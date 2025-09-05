"""
Availability calculation algorithms for Calendar Compare.

This module contains the core algorithms for finding common available time slots
across multiple users' calendars. The algorithms handle:
- Time slot intersection across multiple calendars
- Working hours constraints
- Time zone normalization
- Minimum meeting duration requirements

Key concepts for beginners:
- Time slots: Continuous periods of time (start_time, end_time)
- Busy times: When someone has a calendar event
- Free times: When someone is available (gaps between busy times)
- Intersection: Finding overlapping free time across multiple people
"""

from datetime import datetime, timedelta
from typing import List, Tuple, Dict, Optional
import pytz


class TimeSlot:
    """
    Represents a continuous time period with start and end times.
    
    This is a fundamental building block for availability calculations.
    All times are stored in UTC for consistency.
    """
    
    def __init__(self, start_time: datetime, end_time: datetime):
        """
        Initialize a time slot.
        
        Args:
            start_time (datetime): Start of the time slot (UTC)
            end_time (datetime): End of the time slot (UTC)
        """
        if start_time >= end_time:
            raise ValueError("Start time must be before end time")
        
        self.start_time = start_time
        self.end_time = end_time
    
    def duration_minutes(self) -> int:
        """Get the duration of this time slot in minutes."""
        delta = self.end_time - self.start_time
        return int(delta.total_seconds() / 60)
    
    def overlaps_with(self, other: 'TimeSlot') -> bool:
        """
        Check if this time slot overlaps with another time slot.
        
        Args:
            other (TimeSlot): Another time slot to check against
            
        Returns:
            bool: True if the time slots overlap, False otherwise
        """
        return (self.start_time < other.end_time and 
                self.end_time > other.start_time)
    
    def intersect_with(self, other: 'TimeSlot') -> Optional['TimeSlot']:
        """
        Find the intersection (overlap) between this and another time slot.
        
        Args:
            other (TimeSlot): Another time slot to intersect with
            
        Returns:
            TimeSlot or None: The overlapping time slot, or None if no overlap
        """
        if not self.overlaps_with(other):
            return None
        
        # The intersection starts at the later start time
        # and ends at the earlier end time
        start = max(self.start_time, other.start_time)
        end = min(self.end_time, other.end_time)
        
        return TimeSlot(start, end)
    
    def to_dict(self) -> Dict:
        """Convert time slot to dictionary for JSON serialization."""
        return {
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'duration_minutes': self.duration_minutes()
        }
    
    def __repr__(self):
        return f"TimeSlot({self.start_time} to {self.end_time})"
    
    def __eq__(self, other):
        if not isinstance(other, TimeSlot):
            return False
        return (self.start_time == other.start_time and 
                self.end_time == other.end_time)


class AvailabilityCalculator:
    """
    Main class for calculating availability across multiple users.
    
    This class takes busy times from multiple users and finds common
    free time slots where everyone is available.
    """
    
    def __init__(self, working_hours_start: int = 9, working_hours_end: int = 17):
        """
        Initialize the availability calculator.
        
        Args:
            working_hours_start (int): Start of working hours (24-hour format)
            working_hours_end (int): End of working hours (24-hour format)
        """
        self.working_hours_start = working_hours_start
        self.working_hours_end = working_hours_end
    
    def find_free_time_slots(self, busy_times: List[TimeSlot], 
                           start_date: datetime, end_date: datetime,
                           min_duration_minutes: int = 30) -> List[TimeSlot]:
        """
        Find free time slots in a single person's calendar.
        
        This method looks at someone's busy times and finds the gaps
        between them that are long enough for a meeting.
        
        Args:
            busy_times (List[TimeSlot]): List of busy time slots
            start_date (datetime): Start of the search period
            end_date (datetime): End of the search period
            min_duration_minutes (int): Minimum duration for a valid slot
            
        Returns:
            List[TimeSlot]: List of available time slots
        """
        free_slots = []
        
        # Sort busy times by start time for easier processing
        busy_times_sorted = sorted(busy_times, key=lambda slot: slot.start_time)
        
        # Generate working days in the date range
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        while current_date <= end_date_only:
            # Create working hours for this day
            day_start = datetime.combine(current_date, datetime.min.time()).replace(
                hour=self.working_hours_start, minute=0, second=0, microsecond=0, tzinfo=pytz.UTC
            )
            day_end = datetime.combine(current_date, datetime.min.time()).replace(
                hour=self.working_hours_end, minute=0, second=0, microsecond=0, tzinfo=pytz.UTC
            )
            
            # Filter busy times for this day
            day_busy_times = [
                slot for slot in busy_times_sorted
                if slot.start_time.date() == current_date or slot.end_time.date() == current_date
            ]
            
            # Find free slots for this day
            day_free_slots = self._find_day_free_slots(
                day_busy_times, day_start, day_end, min_duration_minutes
            )
            free_slots.extend(day_free_slots)
            
            current_date += timedelta(days=1)
        
        return free_slots
    
    def _find_day_free_slots(self, busy_times: List[TimeSlot], 
                           day_start: datetime, day_end: datetime,
                           min_duration_minutes: int) -> List[TimeSlot]:
        """
        Find free time slots within a single day.
        
        Args:
            busy_times (List[TimeSlot]): Busy times for this day
            day_start (datetime): Start of the working day
            day_end (datetime): End of the working day
            min_duration_minutes (int): Minimum duration for valid slots
            
        Returns:
            List[TimeSlot]: Free time slots for this day
        """
        free_slots = []
        
        # Filter and sort busy times that overlap with this day
        relevant_busy_times = []
        for busy_slot in busy_times:
            # Clip busy times to the working day boundaries
            clipped_start = max(busy_slot.start_time, day_start)
            clipped_end = min(busy_slot.end_time, day_end)
            
            if clipped_start < clipped_end:
                relevant_busy_times.append(TimeSlot(clipped_start, clipped_end))
        
        # Sort by start time
        relevant_busy_times.sort(key=lambda slot: slot.start_time)
        
        # Find gaps between busy times
        current_time = day_start
        
        for busy_slot in relevant_busy_times:
            # Check if there's a gap before this busy time
            if current_time < busy_slot.start_time:
                gap_duration = (busy_slot.start_time - current_time).total_seconds() / 60
                if gap_duration >= min_duration_minutes:
                    free_slots.append(TimeSlot(current_time, busy_slot.start_time))
            
            # Move current time to after this busy period
            current_time = max(current_time, busy_slot.end_time)
        
        # Check for free time after the last busy period
        if current_time < day_end:
            gap_duration = (day_end - current_time).total_seconds() / 60
            if gap_duration >= min_duration_minutes:
                free_slots.append(TimeSlot(current_time, day_end))
        
        return free_slots
    
    def find_common_availability(self, user_busy_times: Dict[str, List[TimeSlot]],
                               start_date: datetime, end_date: datetime,
                               min_duration_minutes: int = 30) -> List[Dict]:
        """
        Find time slots when ALL users are available.
        
        This is the main algorithm that takes busy times from multiple users
        and finds the intersection of their free times.
        
        Args:
            user_busy_times (Dict[str, List[TimeSlot]]): Dictionary mapping user IDs to their busy times
            start_date (datetime): Start of the search period
            end_date (datetime): End of the search period
            min_duration_minutes (int): Minimum duration for valid meeting slots
            
        Returns:
            List[Dict]: List of common available time slots with metadata
        """
        if not user_busy_times:
            return []
        
        # Step 1: Calculate free times for each user
        user_free_times = {}
        for user_id, busy_times in user_busy_times.items():
            user_free_times[user_id] = self.find_free_time_slots(
                busy_times, start_date, end_date, min_duration_minutes
            )
        
        # Step 2: Find intersection of all users' free times
        common_slots = self._find_time_intersection(user_free_times, min_duration_minutes)
        
        # Step 3: Convert to dictionary format with metadata
        result = []
        for slot in common_slots:
            result.append({
                'start_time': slot.start_time.isoformat(),
                'end_time': slot.end_time.isoformat(),
                'duration_minutes': slot.duration_minutes(),
                'available_users': list(user_busy_times.keys()),
                'user_count': len(user_busy_times)
            })
        
        return result
    
    def _find_time_intersection(self, user_free_times: Dict[str, List[TimeSlot]],
                              min_duration_minutes: int) -> List[TimeSlot]:
        """
        Find the intersection of free time slots across all users.
        
        This method takes free time slots from multiple users and finds
        only the time periods where EVERYONE is free.
        
        Args:
            user_free_times (Dict[str, List[TimeSlot]]): Free times per user
            min_duration_minutes (int): Minimum duration for valid slots
            
        Returns:
            List[TimeSlot]: Time slots where all users are available
        """
        if not user_free_times:
            return []
        
        # Start with the first user's free times
        user_ids = list(user_free_times.keys())
        common_slots = user_free_times[user_ids[0]][:]
        
        # Intersect with each subsequent user's free times
        for user_id in user_ids[1:]:
            common_slots = self._intersect_slot_lists(
                common_slots, user_free_times[user_id]
            )
        
        # Filter by minimum duration
        return [slot for slot in common_slots 
                if slot.duration_minutes() >= min_duration_minutes]
    
    def _intersect_slot_lists(self, slots_a: List[TimeSlot], 
                            slots_b: List[TimeSlot]) -> List[TimeSlot]:
        """
        Find the intersection between two lists of time slots.
        
        Args:
            slots_a (List[TimeSlot]): First list of time slots
            slots_b (List[TimeSlot]): Second list of time slots
            
        Returns:
            List[TimeSlot]: Intersected time slots
        """
        intersections = []
        
        for slot_a in slots_a:
            for slot_b in slots_b:
                intersection = slot_a.intersect_with(slot_b)
                if intersection:
                    intersections.append(intersection)
        
        # Merge overlapping intersections
        return self._merge_overlapping_slots(intersections)
    
    def _merge_overlapping_slots(self, slots: List[TimeSlot]) -> List[TimeSlot]:
        """
        Merge overlapping time slots into continuous blocks.
        
        Args:
            slots (List[TimeSlot]): List of potentially overlapping slots
            
        Returns:
            List[TimeSlot]: List of merged, non-overlapping slots
        """
        if not slots:
            return []
        
        # Sort slots by start time
        sorted_slots = sorted(slots, key=lambda slot: slot.start_time)
        merged = [sorted_slots[0]]
        
        for current in sorted_slots[1:]:
            last_merged = merged[-1]
            
            # If current slot overlaps or is adjacent to the last merged slot
            if current.start_time <= last_merged.end_time:
                # Extend the last merged slot
                merged[-1] = TimeSlot(
                    last_merged.start_time,
                    max(last_merged.end_time, current.end_time)
                )
            else:
                # Add as a new separate slot
                merged.append(current)
        
        return merged


def parse_calendar_events_to_busy_times(events: List[Dict]) -> List[TimeSlot]:
    """
    Convert Google Calendar events to TimeSlot objects for busy time calculations.
    
    This function takes the raw event data from Google Calendar API
    and converts it into TimeSlot objects that can be used by the
    availability calculation algorithms.
    
    Args:
        events (List[Dict]): List of calendar events from Google Calendar API
        
    Returns:
        List[TimeSlot]: List of busy time slots
    """
    busy_times = []
    
    for event in events:
        # Skip declined events or events where user is not attending
        if event.get('status') == 'cancelled':
            continue
        
        # Get start and end times
        start = event.get('start', {})
        end = event.get('end', {})
        
        # Handle all-day events
        if 'date' in start:
            # All-day events don't block specific time slots
            continue
        
        # Parse datetime strings
        try:
            if 'dateTime' in start and 'dateTime' in end:
                start_time = datetime.fromisoformat(start['dateTime'].replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(end['dateTime'].replace('Z', '+00:00'))
                
                # Convert to UTC if not already
                if start_time.tzinfo is None:
                    start_time = pytz.UTC.localize(start_time)
                else:
                    start_time = start_time.astimezone(pytz.UTC)
                
                if end_time.tzinfo is None:
                    end_time = pytz.UTC.localize(end_time)
                else:
                    end_time = end_time.astimezone(pytz.UTC)
                
                busy_times.append(TimeSlot(start_time, end_time))
        
        except (ValueError, TypeError) as e:
            # Skip events with invalid time data
            print(f"Warning: Skipping event with invalid time data: {e}")
            continue
    
    return busy_times
