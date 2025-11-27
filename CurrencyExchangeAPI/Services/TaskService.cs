using CurrencyExchangeAPI.Models;

namespace CurrencyExchangeAPI.Services
{
    public interface ITaskService
    {
        List<UserStoryTask> GetAllTasks();
        UserStoryTask? GetTaskById(int id);
    }

    public class TaskService : ITaskService
    {
        private readonly List<UserStoryTask> _tasks;
        private readonly object _lockObject = new();

        public TaskService()
        {
            _tasks = new List<UserStoryTask>
            {
                new UserStoryTask
                {
                    Id = 1,
                    Title = "111",
                    Description = "2222",
                    ParentTaskId = null,
                    CreatedAt = new DateTime(2025, 11, 25, 12, 0, 0, DateTimeKind.Utc)
                }
            };
        }

        public List<UserStoryTask> GetAllTasks()
        {
            lock (_lockObject)
            {
                return new List<UserStoryTask>(_tasks);
            }
        }

        public UserStoryTask? GetTaskById(int id)
        {
            lock (_lockObject)
            {
                return _tasks.FirstOrDefault(t => t.Id == id);
            }
        }
    }
}
