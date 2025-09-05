"""
Availability services for Calendar Compare.

This module provides high-level services for calculating group availability
by integrating with the calendar system and applying availability algorithms.

Key responsibilities:
- Fetch calendar data for group members
- Calculate availability using algorithms
- Cache results for performance
- Provide API-friendly data structures
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
import pytz
from flask import current_app

from app.models import Group, User, GroupMembership
from app.calendars.services import CalendarService
from .algorithms import AvailabilityCalculator, parse_calendar_events_to_busy_times


class GroupAvailabilityService:
    """
    Service for calculating availability across group members.
    
    This service coordinates between the calendar system and availability
    algorithms to provide group-level availability information.
    """
    
    def __init__(self):
        """Initialize the group availability service."""
        self.availability_calculator = AvailabilityCalculator()
    
    def get_group_availability(self, group_id: int, start_date: datetime, 
                             end_date: datetime, min_duration_minutes: int = 30,
                             member_ids: Optional[List[int]] = None) -> Dict:
        """
        Calculate availability for all members of a group.
        
        Args:
            group_id (int): ID of the group to analyze
            start_date (datetime): Start of the analysis period
            end_date (datetime): End of the analysis period
            min_duration_minutes (int): Minimum meeting duration in minutes
            member_ids (Optional[List[int]]): Specific members to include (default: all)
            
        Returns:
            Dict: Availability analysis results with common time slots
        """
        try:
            # Get group and validate access
            group = Group.query.get(group_id)
            if not group:
                raise ValueError(f"Group {group_id} not found")
            
            # Get members to analyze
            if member_ids:
                members = User.query.filter(User.id.in_(member_ids)).all()
                # Verify all specified members are in the group
                member_set = {m.id for m in members}
                group_member_set = {m.user_id for m in group.memberships}
                if not member_set.issubset(group_member_set):
                    invalid_members = member_set - group_member_set
                    raise ValueError(f"Members {invalid_members} are not in group {group_id}")
            else:
                members = group.get_members()
            
            if not members:
                return {
                    'success': True,
                    'group_id': group_id,
                    'analysis_period': {
                        'start': start_date.isoformat(),
                        'end': end_date.isoformat()
                    },
                    'members_analyzed': [],
                    'common_availability': [],
                    'message': 'No members to analyze'
                }
            
            # Fetch calendar data for all members
            member_busy_times = {}
            member_info = {}
            
            for member in members:
                try:
                    # Get calendar events for this member
                    events = self._get_member_calendar_events(member, start_date, end_date)
                    
                    # Convert events to busy time slots
                    busy_times = parse_calendar_events_to_busy_times(events)
                    member_busy_times[str(member.id)] = busy_times
                    
                    # Store member info for response
                    member_info[str(member.id)] = {
                        'id': member.id,
                        'name': member.name,
                        'email': member.email,
                        'events_count': len(events),
                        'busy_slots_count': len(busy_times)
                    }
                    
                except Exception as e:
                    current_app.logger.warning(
                        f"Failed to get calendar data for member {member.id}: {str(e)}"
                    )
                    # Include member with no busy times (assume fully available)
                    member_busy_times[str(member.id)] = []
                    member_info[str(member.id)] = {
                        'id': member.id,
                        'name': member.name,
                        'email': member.email,
                        'events_count': 0,
                        'busy_slots_count': 0,
                        'error': 'Calendar access failed'
                    }
            
            # Calculate common availability
            common_slots = self.availability_calculator.find_common_availability(
                member_busy_times, start_date, end_date, min_duration_minutes
            )
            
            return {
                'success': True,
                'group_id': group_id,
                'group_name': group.name,
                'analysis_period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'min_duration_minutes': min_duration_minutes
                },
                'members_analyzed': list(member_info.values()),
                'common_availability': common_slots,
                'total_slots_found': len(common_slots),
                'total_available_hours': sum(
                    slot['duration_minutes'] for slot in common_slots
                ) / 60
            }
            
        except Exception as e:
            current_app.logger.error(f"Error calculating group availability: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'group_id': group_id
            }
    
    def _get_member_calendar_events(self, member: User, start_date: datetime, 
                                  end_date: datetime) -> List[Dict]:
        """
        Fetch calendar events for a group member.
        
        This method handles the integration with the calendar service
        and includes error handling for members who may not have
        calendar access set up.
        
        Args:
            member (User): User to fetch calendar events for
            start_date (datetime): Start of the period
            end_date (datetime): End of the period
            
        Returns:
            List[Dict]: List of calendar events
        """
        try:
            # Note: This assumes the member has calendar credentials stored
            # In a real implementation, you'd need to handle credential storage
            # and retrieval for each group member
            
            # For now, we'll return empty events if no calendar access
            # This would need to be implemented based on your credential storage strategy
            return []
            
        except Exception as e:
            current_app.logger.warning(
                f"Could not fetch calendar for member {member.id}: {str(e)}"
            )
            return []
    
    def get_member_individual_availability(self, user_id: int, start_date: datetime,
                                         end_date: datetime, 
                                         min_duration_minutes: int = 30) -> Dict:
        """
        Calculate availability for a single member.
        
        Args:
            user_id (int): ID of the user to analyze
            start_date (datetime): Start of the analysis period
            end_date (datetime): End of the analysis period
            min_duration_minutes (int): Minimum meeting duration
            
        Returns:
            Dict: Individual availability analysis
        """
        try:
            user = User.query.get(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")
            
            # Get calendar events
            events = self._get_member_calendar_events(user, start_date, end_date)
            
            # Convert to busy times
            busy_times = parse_calendar_events_to_busy_times(events)
            
            # Calculate free time slots
            free_slots = self.availability_calculator.find_free_time_slots(
                busy_times, start_date, end_date, min_duration_minutes
            )
            
            # Convert to API format
            free_slots_data = [slot.to_dict() for slot in free_slots]
            
            return {
                'success': True,
                'user_id': user_id,
                'user_name': user.name,
                'analysis_period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'min_duration_minutes': min_duration_minutes
                },
                'events_count': len(events),
                'busy_slots_count': len(busy_times),
                'free_slots': free_slots_data,
                'total_free_hours': sum(
                    slot['duration_minutes'] for slot in free_slots_data
                ) / 60
            }
            
        except Exception as e:
            current_app.logger.error(f"Error calculating individual availability: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'user_id': user_id
            }
    
    def suggest_meeting_times(self, group_id: int, start_date: datetime,
                            end_date: datetime, meeting_duration_minutes: int,
                            max_suggestions: int = 5) -> Dict:
        """
        Suggest optimal meeting times for a group.
        
        This method finds the best time slots for scheduling a meeting
        by looking for the longest available periods first.
        
        Args:
            group_id (int): ID of the group
            start_date (datetime): Start of the search period
            end_date (datetime): End of the search period
            meeting_duration_minutes (int): Required meeting duration
            max_suggestions (int): Maximum number of suggestions to return
            
        Returns:
            Dict: Suggested meeting times with quality scores
        """
        try:
            # Get group availability
            availability_result = self.get_group_availability(
                group_id, start_date, end_date, meeting_duration_minutes
            )
            
            if not availability_result['success']:
                return availability_result
            
            common_slots = availability_result['common_availability']
            
            if not common_slots:
                return {
                    'success': True,
                    'group_id': group_id,
                    'suggestions': [],
                    'message': 'No common availability found for the specified duration'
                }
            
            # Sort by duration (longest first) and start time
            sorted_slots = sorted(
                common_slots,
                key=lambda slot: (-slot['duration_minutes'], slot['start_time'])
            )
            
            # Generate meeting suggestions
            suggestions = []
            for i, slot in enumerate(sorted_slots[:max_suggestions]):
                start_time = datetime.fromisoformat(slot['start_time'])
                
                # Calculate quality score based on various factors
                quality_score = self._calculate_meeting_quality_score(
                    start_time, slot['duration_minutes'], meeting_duration_minutes
                )
                
                suggestions.append({
                    'rank': i + 1,
                    'start_time': slot['start_time'],
                    'end_time': (start_time + timedelta(minutes=meeting_duration_minutes)).isoformat(),
                    'slot_duration_minutes': slot['duration_minutes'],
                    'meeting_duration_minutes': meeting_duration_minutes,
                    'available_users': slot['available_users'],
                    'user_count': slot['user_count'],
                    'quality_score': quality_score,
                    'time_of_day': self._get_time_of_day_label(start_time),
                    'day_of_week': start_time.strftime('%A')
                })
            
            return {
                'success': True,
                'group_id': group_id,
                'group_name': availability_result['group_name'],
                'search_criteria': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'meeting_duration_minutes': meeting_duration_minutes,
                    'max_suggestions': max_suggestions
                },
                'suggestions': suggestions,
                'total_suggestions': len(suggestions)
            }
            
        except Exception as e:
            current_app.logger.error(f"Error generating meeting suggestions: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'group_id': group_id
            }
    
    def _calculate_meeting_quality_score(self, start_time: datetime, 
                                       slot_duration: int, 
                                       meeting_duration: int) -> float:
        """
        Calculate a quality score for a meeting time slot.
        
        Higher scores indicate better meeting times based on:
        - Time of day (prefer business hours)
        - Day of week (prefer weekdays)
        - Buffer time after meeting
        
        Args:
            start_time (datetime): Meeting start time
            slot_duration (int): Total available slot duration
            meeting_duration (int): Required meeting duration
            
        Returns:
            float: Quality score between 0 and 1
        """
        score = 0.0
        
        # Time of day scoring (prefer 9 AM - 4 PM)
        hour = start_time.hour
        if 9 <= hour <= 16:
            score += 0.4  # Prime meeting hours
        elif 8 <= hour <= 17:
            score += 0.3  # Acceptable hours
        elif 7 <= hour <= 18:
            score += 0.2  # Early/late but workable
        else:
            score += 0.1  # Outside normal hours
        
        # Day of week scoring (prefer Tuesday-Thursday)
        weekday = start_time.weekday()  # Monday = 0, Sunday = 6
        if 1 <= weekday <= 3:  # Tuesday-Thursday
            score += 0.3
        elif weekday in [0, 4]:  # Monday, Friday
            score += 0.2
        else:  # Weekend
            score += 0.1
        
        # Buffer time scoring (prefer slots with extra time)
        buffer_minutes = slot_duration - meeting_duration
        if buffer_minutes >= 30:
            score += 0.2
        elif buffer_minutes >= 15:
            score += 0.1
        
        # Duration fit scoring
        if slot_duration >= meeting_duration * 2:
            score += 0.1  # Plenty of time
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _get_time_of_day_label(self, start_time: datetime) -> str:
        """
        Get a human-readable label for the time of day.
        
        Args:
            start_time (datetime): The meeting start time
            
        Returns:
            str: Time of day label
        """
        hour = start_time.hour
        
        if 6 <= hour < 12:
            return "Morning"
        elif 12 <= hour < 17:
            return "Afternoon"
        elif 17 <= hour < 21:
            return "Evening"
        else:
            return "Night"
