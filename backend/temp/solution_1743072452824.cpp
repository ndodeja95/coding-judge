#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> numMap; // To store number and its index
    
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];

        if (numMap.find(complement) != numMap.end()) {
            return {numMap[complement], i}; // Return indices of the two numbers
        }
        
        numMap[nums[i]] = i; // Store the current number and its index
    }

    return {}; // No solution found
}

// Example usage:
// vector<int> nums = {2,7,11,15};
// vector<int> result = twoSum(nums, 9);
// Should return [0,1]